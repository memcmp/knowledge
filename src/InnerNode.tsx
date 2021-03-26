import React from "react";
import { Card } from "react-bootstrap";
import { Draggable } from "react-beautiful-dnd";
import { useSelectors } from "./DataContext";

type InnderNodeProps = {
  nodeID: string;
  index: number;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function InnerNode({ nodeID, index }: InnderNodeProps): JSX.Element {
  const { getNode } = useSelectors();
  const node = getNode(nodeID);
  // TODO: use Quill
  return (
    <Draggable key={nodeID} draggableId={`${nodeID}`} index={index}>
      {providedDraggable => (
        <div
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
          {...providedDraggable.dragHandleProps}
          style={providedDraggable.draggableProps.style}
        >
          <Card className="inner-node">
            <Card.Body className="p-3">{node.text}</Card.Body>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
