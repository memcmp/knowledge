import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { AddNode } from "./AddNode";
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
  return (
    <div className="workspace-column" key={column.columnID}>
      {column.nodeViews.map((nodeView, i) => (
        <OuterNode
          key={`drag.outer.${nodeView.nodeID}.${column.columnID}.${i}`}
          nodeID={nodeView.nodeID}
          dndPostfix={`${column.columnID}.${i}`}
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
                <AddNode column={column} />
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
