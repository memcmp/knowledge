import React from "react";

import { useSelectors } from "./DataContext";

import { InnerNode } from "./InnerNode";

import { extractPlainText } from "./Searchbox";

type OuterNodeProps = {
  nodeID: string;
};

export function OuterNode({ nodeID }: OuterNodeProps): JSX.Element {
  const { getNode, getObjects, getSubjects } = useSelectors();
  const node = getNode(nodeID);
  const text = extractPlainText(node);

  const contains = getObjects(node, undefined, ["CONTAINS"]);
  const relevantObjects = getObjects(node, undefined, ["RELEVANT"]);
  const subjects = getSubjects(node);
  return (
    <div className="outer-node mb-2">
      <div className="outer-node-title">{text}</div>
      {subjects.map(subj => {
        return <InnerNode nodeID={subj.id} />;
      })}
      {relevantObjects.map(subj => {
        return <InnerNode nodeID={subj.id} />;
      })}
      {contains.map(subj => {
        return <InnerNode nodeID={subj.id} />;
      })}
    </div>
  );
}
