import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
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
      <Droppable
        droppableId={`drop.column.${column.columnID}`}
        key={column.columnID}
      >
        {provided => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="h-100"
          >
            {column.nodeViews.map((nodeView, i) => (
              <Draggable
                key={`drag.outer.${nodeView.nodeID}.${column.columnID}.${i}`}
                draggableId={`drag.outer.${nodeView.nodeID}.${column.columnID}.${i}`}
                index={i}
              >
                {providedDraggable => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    style={{ ...providedDraggable.draggableProps.style }}
                  >
                    <OuterNode
                      nodeID={nodeView.nodeID}
                      dndPostfix={`${column.columnID}.${i}`}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
