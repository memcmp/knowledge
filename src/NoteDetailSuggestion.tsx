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
  const { getAllNodesByType } = useSelectors();

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

  // TODO: Use last suggestion again
  const suggestions = getAllNodesByType("TOPIC").filter(
    suggestion =>
      node.relationsToObjects.filter(rel => rel.b === suggestion.id).length ===
      0
  );

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
