import React, { useState } from "react";
import { Map } from "immutable";
import { Droppable } from "react-beautiful-dnd";
import { Card } from "react-bootstrap";
import { bulkConnectRelevantNodes } from "./connections";
import { useSelectors, Selectors } from "./DataContext";

import { FileDropZone } from "./FileDropZone";

import { InnerNode } from "./InnerNode";

import { AddNodeToNode } from "./AddNode";

import { OuterNodeMenu } from "./OuterNodeExtras";

function getChildNodes(
  node: KnowNode,
  selectors: Selectors,
  displayConnections: DisplayConnections
): Array<KnowNode> {
  if (displayConnections === "CONTAINS_OBJECTS") {
    return selectors.getObjects(node, undefined, ["CONTAINS"]);
  }
  if (displayConnections === "RELEVANT_OBJECTS") {
    return selectors.getObjects(node, undefined, ["RELEVANT"]);
  }
  return selectors.getSubjects(node, undefined, ["RELEVANT"]);
}

type OuterNodeProps = {
  nodeView: NodeView;
  dndPostfix: string;
  onNodeViewChange: (nodeView: NodeView, nodes: Nodes) => void;
  onRemove: () => void;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function OuterNode({
  nodeView,
  dndPostfix,
  onNodeViewChange,
  onRemove
}: OuterNodeProps): JSX.Element {
  const selectors = useSelectors();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { nodeID } = nodeView;
  const node = selectors.getNode(nodeID);
  const toDisplay = nodeView.expanded
    ? getChildNodes(node, selectors, nodeView.displayConnections)
    : [];
  const onDropFiles = (topNodes: Array<string>, nodes: Nodes): void => {
    onNodeViewChange(
      {
        ...nodeView,
        // TODO: Find a better solution than switching subjects
        displayConnections: "RELEVANT_SUBJECTS"
      },
      bulkConnectRelevantNodes(
        topNodes,
        nodeID,
        Map<string, KnowNode>()
          .set(node.id, node)
          .merge(nodes)
      )
    );
  };

  const onConnectionsChange = (
    displayConnections: DisplayConnections
  ): void => {
    onNodeViewChange(
      {
        ...nodeView,
        expanded: true,
        displayConnections
      },
      Map<string, KnowNode>()
    );
  };

  const toggleView = (): void => {
    onNodeViewChange(
      {
        ...nodeView,
        expanded: !nodeView.expanded
      },
      Map<string, KnowNode>()
    );
  };

  return (
    <div
      className={`mb-2 outer-node ${
        nodeView.displayConnections === "RELEVANT_OBJECTS" ? "backside" : ""
      }`}
      key={`outer.${node.id}.${dndPostfix}`}
    >
      <FileDropZone onDrop={onDropFiles}>
        <div className="outer-node-title border-bottom mb-1">
          {showMenu && (
            <Card className="inner-node">
              <Card.Body className="p-0">
                <OuterNodeMenu
                  displayConnections={nodeView.displayConnections}
                  onRemove={onRemove}
                  onConnectionsChange={onConnectionsChange}
                />
              </Card.Body>
            </Card>
          )}
          <div className="position-relative">
            <button
              type="button"
              className="btn outer-node-extras-btn outer-node-menu-btn hover-black"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="simple-icon-options-vertical" />
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
                >
                  <button
                    type="button"
                    className="toggle-button"
                    onClick={toggleView}
                  >
                    {!nodeView.expanded && (
                      <span className="simple-icon-arrow-right" />
                    )}
                    {nodeView.expanded && (
                      <span className="simple-icon-arrow-down" />
                    )}
                  </button>
                  {node.text}
                </InnerNode>
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
                    >
                      {subj.text}
                    </InnerNode>
                  );
                })}
                {snapshot.isDraggingOver && provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        {nodeView.expanded && (
          <Droppable
            droppableId={`drop.addtonode.${nodeID}.${dndPostfix}`}
            key={`drop.addtonode.${nodeID}.${dndPostfix}`}
          >
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`${snapshot.isDraggingOver ? "dragging-over" : ""}`}
              >
                {provided.placeholder}
                {!snapshot.isDraggingOver && (
                  <div className="add-to-node">
                    <AddNodeToNode parentNodeView={nodeView} />
                  </div>
                )}
              </div>
            )}
          </Droppable>
        )}
      </FileDropZone>
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
