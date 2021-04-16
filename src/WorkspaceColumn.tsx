import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { AddNode } from "./AddNode";
import { useUpdateWorkspace, useWorkspace } from "./DataContext";
import { FileDropZone } from "./FileDropZone";
import { OuterNode } from "./OuterNode";

type WorkspaceColumnProps = {
  column: WorkspaceColumn;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable react/no-array-index-key */
export function WorkspaceColumnView({
  column
}: WorkspaceColumnProps): JSX.Element {
  const workspace = useWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const onDropFiles = (topNodes: Array<string>, nodes: Nodes): void => {
    const nodeViews: Array<NodeView> = topNodes.map(nodeID => {
      return {
        nodeID,
        displayConnections: "NONE"
      };
    });
    updateWorkspace(
      {
        columns: workspace.columns.set(column.columnID, {
          ...column,
          nodeViews: column.nodeViews.push(...nodeViews)
        })
      },
      nodes
    );
  };

  return (
    <div className="workspace-column" key={column.columnID}>
      {column.nodeViews.map((nodeView, i) => (
        <OuterNode
          key={`drag.outer.${nodeView.nodeID}.${column.columnID}.${i}`}
          nodeView={nodeView}
          dndPostfix={`${column.columnID}.${i}`}
          onNodeViewChange={(newView: NodeView, nodes: Nodes): void => {
            updateWorkspace(
              {
                columns: workspace.columns.set(column.columnID, {
                  ...column,
                  nodeViews: column.nodeViews.set(i, newView)
                })
              },
              nodes
            );
          }}
        />
      ))}
      <Droppable
        droppableId={`drop.column.${column.columnID}`}
        key={column.columnID}
      >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`${snapshot.isDraggingOver ? "dragging-over" : ""}`}
          >
            {provided.placeholder}
            {!snapshot.isDraggingOver && (
              <div className="outer-node">
                <FileDropZone onDrop={onDropFiles}>
                  <AddNode column={column} />
                </FileDropZone>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
