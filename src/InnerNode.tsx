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
/* eslint-disable jsx-a11y/label-has-associated-control */
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
              <div className="d-flex align-center pl-2">
                <div className="checkbox">
                  <div className="pretty p-default p-round font-size-select">
                    <input type="checkbox" />
                    <div className="state p-info p-info-o">
                      <label />
                    </div>
                  </div>
                </div>
                <div className="next-to-checkbox">
                  <Card.Body className="p-3">{children}</Card.Body>
                </div>
              </div>
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
