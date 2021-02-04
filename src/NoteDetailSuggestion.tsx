import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useAddBucket, useSelectors } from "./DataContext";
import { Suggest } from "./Suggest";
import Immutable from "immutable";

import { connectRelevantNodes } from "./connections";

function NoteDetailSuggestions({
  node,
  parentNode
}: {
  parentNode: KnowNode;
  node: KnowNode;
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
      [parentNode.id]: parentNode,
      [insertNode.id]: insertNode
    }).merge(additionalNodes);
    const connectWithEachOther = connectRelevantNodes(
      node.id,
      insertNode.id,
      nodes
    );
    const connectWithParent = connectRelevantNodes(
      parentNode.id,
      insertNode.id,
      connectWithEachOther
    );
    addBucket(connectWithParent);
  };

  // memoize!
  // TODO: reference counting for better score
  const findSuggestions = (node: KnowNode, levels: number): Array<string> => {
    if (levels === 0) {
      return [];
    }
    const objects = [
      ...getObjects(node, ["TOPIC"]),
      ...getSubjects(node, ["NOTE"])
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
  const closeSuggestions = new Set(findSuggestions(parentNode, 2));
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
          />
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export { NoteDetailSuggestions };
