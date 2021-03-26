import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelectors } from "./DataContext";

import { InnerNode } from "./InnerNode";

import { extractPlainText } from "./Searchbox";

type OuterNodeProps = {
  nodeID: string;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function OuterNode({ nodeID }: OuterNodeProps): JSX.Element {
  const { getNode, getObjects, getSubjects } = useSelectors();
  const node = getNode(nodeID);
  const text = extractPlainText(node);

  const contains = getObjects(node, undefined, ["CONTAINS"]);
  // const relevantObjects = getObjects(node, undefined, ["RELEVANT"]);
  const subjects = getSubjects(node);
  const toDisplay = contains.length > 0 ? contains : subjects;
  return (
    <div className="mb-3 outer-node" key={node.id}>
      <div className="outer-node-title">
        <div className="p-2">{text}</div>
      </div>

      <div className="inner-nodes">
        <Droppable droppableId={`droppable-outer-${nodeID}`}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {toDisplay.map((subj, i) => {
                return <InnerNode key={subj.id} nodeID={subj.id} index={i} />;
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
