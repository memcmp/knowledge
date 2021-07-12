import React from "react";
import { Card } from "react-bootstrap";
import { Draggable } from "react-beautiful-dnd";

type InnderNodeProps = {
  nodeID: string;
  index: number;
  dndPostfix: string;
  children: React.ReactNode;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function InnerNode({
  children,
  nodeID,
  index,
  dndPostfix
}: InnderNodeProps): JSX.Element {
  return (
    <Draggable
      key={nodeID}
      draggableId={`drag.inner.${nodeID}.${dndPostfix}`}
      index={index}
    >
      {(providedDraggable, snapshot) => (
        <>
          <div
            ref={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            {...providedDraggable.dragHandleProps}
            style={providedDraggable.draggableProps.style}
          >
            <Card className="inner-node">
              <Card.Body className="p-3">{children}</Card.Body>
            </Card>
          </div>
          {snapshot.isDragging &&
            snapshot.draggingOver !== `drop.outer.${dndPostfix}` && (
              <Card className="inner-node">
                <Card.Body className="p-3">{children}</Card.Body>
              </Card>
            )}
        </>
      )}
    </Draggable>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
