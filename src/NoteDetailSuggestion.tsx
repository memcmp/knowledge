import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useAddBucket, useSelectors } from "./DataContext";
import { Suggest } from "./Suggest";
import Immutable from "immutable";

import { connectRelevantNodes } from "./connections";

function NoteDetailSuggestions({
  node,
  parentNode,
  allowNodeBelow,
  onClose
}: {
  parentNode?: KnowNode;
  node: KnowNode;
  allowNodeBelow?: boolean;
  onClose: () => void;
}): JSX.Element {
  const addBucket = useAddBucket();
  const {
    getAllNodesByType,
    getObjects,
    getSubjects,
    getNode
  } = useSelectors();

  const insertNodeAbove = (
    insertNode: KnowNode,
    additionalNodes: Nodes
  ): void => {
    const nodes = Immutable.Map({
      [node.id]: node,
      [insertNode.id]: insertNode
    })
      .merge(parentNode ? { [parentNode.id]: parentNode } : {})
      .merge(additionalNodes);
    const connectWithEachOther = connectRelevantNodes(
      node.id,
      insertNode.id,
      nodes
    );
    const connectWithParentIfExists = parentNode
      ? connectRelevantNodes(parentNode.id, insertNode.id, connectWithEachOther)
      : connectWithEachOther;
    addBucket(connectWithParentIfExists);
    onClose();
  };

  const insertNodeBelow = (
    insertNode: KnowNode,
    additionalNodes: Nodes
  ): void => {
    const nodes = Immutable.Map({
      [node.id]: node,
      [insertNode.id]: insertNode
    }).merge(additionalNodes);
    const connect = connectRelevantNodes(insertNode.id, node.id, nodes);
    addBucket(connect);
    onClose();
  };

  // memoize!
  // TODO: reference counting for better score
  // TODO: check why I don't find notes of other topics
  const findSuggestions = (node: KnowNode, levels: number): Array<string> => {
    if (levels === 0) {
      return [];
    }
    const objects = [
      ...getObjects(node, ["TOPIC"]),
      ...getSubjects(node, ["TOPIC", "NOTE"])
    ];
    return [
      ...objects.map(obj => obj.id),
      ...objects
        .map((obj: KnowNode) => {
          return findSuggestions(obj, levels - 1);
        })
        .flat()
    ];
  };

  // TODO: Don't show suggestions with existing connections
  const closeSuggestions = new Set(
    findSuggestions(parentNode ? parentNode : node, 3)
  );
  const otherSuggestions = getAllNodesByType("TOPIC")
    .map(topic => topic.id)
    .filter(topic => !closeSuggestions.has(topic));

  const existingSuggestions = getObjects(node, ["TOPIC"]).map(
    topic => topic.id
  );
  const suggestions = [
    ...Array.from(closeSuggestions),
    ...Array.from(otherSuggestions)
  ]
    .filter(id => !existingSuggestions.includes(id))
    .map(id => getNode(id));

  return (
    <div>
      <Form.Group>
        <InputGroup className="input-group-sm mt-4">
          <InputGroup.Prepend>
            <InputGroup.Text className="text-primary">
              Relevant for
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Suggest
            nodes={suggestions}
            onAddNodeAbove={(insertNode: KnowNode, additionalNodes: Nodes) => {
              insertNodeAbove(insertNode, additionalNodes);
            }}
            onAddNodeBelow={
              allowNodeBelow
                ? (insertNode: KnowNode, additionalNodes: Nodes) => {
                    insertNodeBelow(insertNode, additionalNodes);
                  }
                : undefined
            }
          />
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export { NoteDetailSuggestions };
