import React from "react";
import { Card } from "react-bootstrap";
import { useSelectors } from "./DataContext";
import { ReadonlyNode } from "./ReadonlyNode";

type InnderNodeProps = {
  nodeID: string;
};

export function InnerNode({ nodeID }: InnderNodeProps): JSX.Element {
  const { getNode } = useSelectors();
  const node = getNode(nodeID);
  // TODO: use Quill
  return (
    <Card className="inner-node">
      <Card.Body className="header p-0">
        <ReadonlyNode node={node} />
      </Card.Body>
    </Card>
  );
}
