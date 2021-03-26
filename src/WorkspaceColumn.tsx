import React from "react";
import { Droppable } from "react-beautiful-dnd";
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
              <OuterNode
                key={`drag.outer.${nodeView.nodeID}.${column.columnID}.${i}`}
                nodeID={nodeView.nodeID}
                dndPostfix={`${column.columnID}.${i}`}
              />
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
