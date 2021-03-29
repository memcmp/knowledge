import React from "react";
import Immutable from "immutable";
import { v4 } from "uuid";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import "./Workspace.css";

import { WorkspaceColumnView } from "./WorkspaceColumn";

import { useUpdateWorkspace } from "./DataContext";

type WorkspaceViewProps = {
  workspace: Workspace;
};

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

export function WorkspaceView({ workspace }: WorkspaceViewProps): JSX.Element {
  const updateWorkspace = useUpdateWorkspace();

  const workspaceWithNewCol = {
    ...workspace,
    columns: !isEmptyColumn(workspace.columns.last())
      ? workspace.columns.push({
          columnID: v4(),
          nodeViews: Immutable.List<NodeView>([])
        })
      : workspace.columns
  };

  const onDragEnd = (result: DropResult): void => {
    if (result.destination) {
      const { index } = result.destination;
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
              nodeViews: column.nodeViews.insert(index, {
                nodeID: sourceID
              })
            };
          }
          return column;
        });
        updateWorkspace({
          ...workspaceWithNewCol,
          columns: updatedColumns
        });
      }
    }
  };

  return (
    <div className="h-100 w-100">
      <div className="workspace-columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {workspaceWithNewCol.columns.map(column => {
            return (
              <WorkspaceColumnView key={column.columnID} column={column} />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
