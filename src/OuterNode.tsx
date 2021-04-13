import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelectors } from "./DataContext";

import { InnerNode } from "./InnerNode";

type OuterNodeProps = {
  nodeID: string;
  dndPostfix: string;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function OuterNode({ nodeID, dndPostfix }: OuterNodeProps): JSX.Element {
  const { getNode, getObjects, getSubjects } = useSelectors();
  const node = getNode(nodeID);

  const contains = getObjects(node, undefined, ["CONTAINS"]);
  // const relevantObjects = getObjects(node, undefined, ["RELEVANT"]);
  const subjects = getSubjects(node);
  const toDisplay = contains.length > 0 ? contains : subjects;
  return (
    <div className="mb-3 outer-node" key={`outer.${node.id}.${dndPostfix}`}>
      <div className="outer-node-title border-bottom mb-1">
        <Droppable
          droppableId={`drop.title.${nodeID}.${dndPostfix}`}
          key={`drop.title.${nodeID}.${dndPostfix}`}
          isDropDisabled
        >
          {provided => (
            <>
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <InnerNode
                  nodeID={node.id}
                  index={0}
                  dndPostfix={`title.${nodeID}.${dndPostfix}`}
                />
              </div>
            </>
          )}
        </Droppable>
      </div>

      <div className="inner-nodes">
        <Droppable droppableId={`drop.outer.${nodeID}.${dndPostfix}`}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {toDisplay.map((subj, i) => {
                return (
                  <InnerNode
                    key={subj.id}
                    nodeID={subj.id}
                    index={i}
                    dndPostfix={`${nodeID}.${dndPostfix}`}
                  />
                );
              })}
              {snapshot.isDraggingOver && provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */