import React from "react";
import Immutable from "immutable";
import { v4 } from "uuid";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import "./Workspace.css";

import { WorkspaceColumnView } from "./WorkspaceColumn";

import {
  useSelectors,
  useUpdateWorkspace,
  useUpsertNodes,
  useWorkspace
} from "./DataContext";

import { defaultDisplayConnection } from "./connections";

import { connectNodes } from "./AddNode";

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
  if (dndID.startsWith("drag.inner.")) {
    return dndID.replace("drag.inner.", "").split(".")[0];
  }
  return undefined;
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

export function WorkspaceView(): JSX.Element {
  const workspace = useWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const upsertNodes = useUpsertNodes();
  const { getNode } = useSelectors();

  const workspaceWithNewCol = {
    ...workspace,
    columns: !isEmptyColumn(workspace.columns.last())
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
      if (droppableID.startsWith("drop.column.")) {
        const updatedColumns = workspaceWithNewCol.columns.map(column => {
          if (column.columnID === destID) {
            return {
              ...column,
              nodeViews: column.nodeViews.push({
                nodeID: sourceID,
                displayConnections: defaultDisplayConnection(
                  getNode(sourceID).nodeType
                )
              })
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
      } else if (droppableID.startsWith("drop.outer")) {
        const [outerNodeID, column, n] = droppableID
          .replace("drop.outer.", "")
          .split(".");
        const view = (workspaceWithNewCol.columns.get(
          column
        ) as WorkspaceColumn).nodeViews.get(parseInt(n, 10)) as NodeView;
        const outerNode = getNode(outerNodeID);
        const innerNode = getNode(sourceID);
        upsertNodes(
          connectNodes(outerNode, innerNode, view.displayConnections)
        );
      }
    }
  };

  const columns = Array.from(workspaceWithNewCol.columns.values());

  return (
    <div className="h-100 w-100">
      <div className="workspace-columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(column => {
            return (
              <WorkspaceColumnView key={column.columnID} column={column} />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
