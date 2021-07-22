import React, { useState } from "react";
import Immutable, { Set } from "immutable";
import { v4 } from "uuid";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import "./Workspace.scss";

import { WorkspaceColumnView } from "./WorkspaceColumn";

import {
  useNodes,
  useUpdateWorkspace,
  useUpsertNodes,
  useWorkspace,
  getNode,
  createSelectors
} from "./DataContext";

import { defaultDisplayConnection } from "./connections";

import { connectNodes } from "./AddNode";

import {
  deselectByPostfix,
  findSelectedByPostfix,
  MultiSelectionContext
} from "./MultiSelectContext";

/*
 * drop-column-columnID
 * drag-outer-nodeID-columnID-0
 * drop-outer-nodeID-columnID-0
 * drag-inner-innerNodeID-outerNodeID-columnID-0
 */
function parseID(dndID: string): string | undefined {
  if (dndID.startsWith("drop.column.")) {
    return dndID.replace("drop.column.", "");
  }
  if (dndID.startsWith("drag.outer.")) {
    return dndID.replace("drag.outer.", "").split(".")[0];
  }
  if (dndID.startsWith("drop.outer.")) {
    return dndID.replace("drop.outer.", "").split(".")[0];
  }
  if (dndID.startsWith("drop.addtonode.")) {
    return dndID.replace("drop.addtonode.", "").split(".")[0];
  }
  if (dndID.startsWith("drag.inner.")) {
    return dndID.replace("drag.inner.", "").split(".")[0];
  }
  return undefined;
}

function parsePostfix(dndID: string): string | undefined {
  return dndID
    .split(".")
    .slice(3)
    .join(".");
}

function isEmptyColumn(column: WorkspaceColumn | undefined): boolean {
  if (!column) {
    return true;
  }
  return column.nodeViews.isEmpty();
}

function addEmptyColumn(workspace: Workspace): Workspace {
  const columnID = v4();
  return {
    ...workspace,
    columns: workspace.columns.set(columnID, {
      columnID,
      nodeViews: Immutable.List<NodeView>([])
    })
  };
}

function parseDroppableID(
  droppableID: string
): {
  dropTargetType: string;
  outerNodeID: string;
  column: string;
  viewIndex: number;
} {
  if (
    !(
      droppableID.startsWith("drop.outer") ||
      droppableID.startsWith("drop.addtonode")
    )
  ) {
    throw new Error(`Unknown droppable ID: '${droppableID}'`);
  }
  const [dropTargetType, outerNodeID, column, n] = droppableID
    .replace("drop.", "")
    .split(".");
  return {
    dropTargetType,
    outerNodeID,
    column,
    viewIndex: parseInt(n, 10)
  };
}

export function WorkspaceView(): JSX.Element {
  const workspace = useWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const upsertNodes = useUpsertNodes();
  const nodes = useNodes();
  const [selection, setSelection] = useState<Set<string>>(Set<string>());

  const workspaceWithNewCol = {
    ...workspace,
    columns:
      !isEmptyColumn(workspace.columns.last()) || workspace.columns.size === 0
        ? addEmptyColumn(workspace).columns
        : workspace.columns
  };

  const onDragEnd = (result: DropResult): void => {
    if (result.destination) {
      const droppableID = result.destination.droppableId;
      const destID = parseID(droppableID);
      const sourceID = parseID(result.draggableId);
      if (!destID || !sourceID) {
        return;
      }
      const sourcePostfix = parsePostfix(result.draggableId);
      const selectedSources =
        sourcePostfix === undefined
          ? Set([sourceID])
          : findSelectedByPostfix(selection, sourcePostfix);
      const sourceIDs = selectedSources.contains(sourceID)
        ? selectedSources
        : Set([sourceID]);
      if (droppableID.startsWith("drop.column.")) {
        const updatedColumns = workspaceWithNewCol.columns.map(column => {
          if (column.columnID === destID) {
            return {
              ...column,
              nodeViews: column.nodeViews.push(
                ...sourceIDs.toArray().map(id => {
                  return {
                    expanded: true,
                    nodeID: id,
                    displayConnections: defaultDisplayConnection(
                      getNode(nodes, id).nodeType
                    )
                  };
                })
              )
            };
          }
          return column;
        });
        updateWorkspace(
          {
            ...workspaceWithNewCol,
            columns: updatedColumns
          },
          Immutable.Map<string, KnowNode>()
        );
      } else if (
        droppableID.startsWith("drop.outer") ||
        droppableID.startsWith("drop.addtonode")
      ) {
        const { dropTargetType, column, viewIndex } = parseDroppableID(
          droppableID
        );
        const index =
          dropTargetType === "outer" ? result.destination.index : undefined;
        const view = (workspaceWithNewCol.columns.get(
          column
        ) as WorkspaceColumn).nodeViews.get(viewIndex) as NodeView;

        const updatedNodes = sourceIDs.toArray().reduceRight((rdx, id) => {
          const outerNode = getNode(rdx, view.nodeID);
          const innerNode = getNode(rdx, id);
          return rdx.merge(
            connectNodes(
              outerNode,
              innerNode,
              view.displayConnections,
              createSelectors(rdx).getSubjects,
              index
            )
          );
        }, nodes);
        upsertNodes(updatedNodes);
      }
      if (sourcePostfix) {
        setSelection(deselectByPostfix(selection, sourcePostfix));
      }
    }
  };

  const columns = Array.from(workspaceWithNewCol.columns.values());

  return (
    <MultiSelectionContext.Provider value={{ selection, setSelection }}>
      <div className="workspace-columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(column => {
            return (
              <WorkspaceColumnView key={column.columnID} column={column} />
            );
          })}
        </DragDropContext>
      </div>
    </MultiSelectionContext.Provider>
  );
}
