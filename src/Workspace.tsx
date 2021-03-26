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

export function WorkspaceView({ workspace }: WorkspaceViewProps): JSX.Element {
  const updateWorkspace = useUpdateWorkspace();

  const workspaceWithNewCol = {
    ...workspace,
    // TODO: only do that if last column is not empty
    columns: workspace.columns.push({
      columnID: v4(),
      nodeViews: Immutable.List<NodeView>([])
    })
  };

  const onDragEnd = (result: DropResult): void => {
    if (result.destination) {
      const droppableID = result.destination.droppableId;
      if (droppableID.startsWith("column-")) {
        const colID = droppableID.replace("column-", "");
        const { index } = result.destination;
        const updatedColumns = workspaceWithNewCol.columns.map(column => {
          if (column.columnID === colID) {
            return {
              ...column,
              nodeViews: column.nodeViews.insert(index, {
                nodeID: result.draggableId
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
