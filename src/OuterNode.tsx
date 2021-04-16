import { Map } from "immutable";
import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { bulkConnectRelevantNodes } from "./connections";
import { useSelectors, useUpsertNodes } from "./DataContext";

import { FileDropZone } from "./FileDropZone";

import { InnerNode } from "./InnerNode";

type OuterNodeProps = {
  nodeID: string;
  dndPostfix: string;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function OuterNode({ nodeID, dndPostfix }: OuterNodeProps): JSX.Element {
  const { getNode, getObjects, getSubjects } = useSelectors();
  const upsertNodes = useUpsertNodes();
  const node = getNode(nodeID);

  const contains = getObjects(node, undefined, ["CONTAINS"]);
  // const relevantObjects = getObjects(node, undefined, ["RELEVANT"]);
  const subjects = getSubjects(node);
  const toDisplay = contains.length > 0 ? contains : subjects;
  const onDropFiles = (topNodes: Array<string>, nodes: Nodes): void => {
    upsertNodes(
      bulkConnectRelevantNodes(
        topNodes,
        nodeID,
        Map<string, KnowNode>()
          .set(node.id, node)
          .merge(nodes)
      )
    );
  };

  return (
    <div className="mb-3 outer-node" key={`outer.${node.id}.${dndPostfix}`}>
      <FileDropZone onDrop={onDropFiles}>
        <div className="outer-node-title border-bottom mb-1">
          <div className="position-relative">
            <button type="button" className="btn header-extras-btn hover-black">
              <span className="simple-icon-options" />
            </button>
          </div>
          <Droppable
            droppableId={`drop.title.${nodeID}.${dndPostfix}`}
            key={`drop.title.${nodeID}.${dndPostfix}`}
            isDropDisabled
          >
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <InnerNode
                  nodeID={node.id}
                  index={0}
                  dndPostfix={`title.${nodeID}.${dndPostfix}`}
                />
              </div>
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
      </FileDropZone>
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
