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
  const { getChildren } = useSelectors();

  const insertNodeAbove = (
    insertNode: KnowNode,
    additionalNodes: Nodes
  ): void => {
    const nodes = Immutable.Map({
      [node.id]: node,
      [parentNode.id]: parentNode,
      [insertNode.id]: insertNode
    });
    // TODO: Overthink relation direction ( should be the other way around )
    const connectWithEachOther = connectRelevantNodes(
      insertNode.id,
      node.id,
      nodes
    );
    const connectWithParent = connectRelevantNodes(
      parentNode.id,
      insertNode.id,
      connectWithEachOther
    );
    addBucket(connectWithParent);
  };

  const suggestions = getChildren(parentNode, ["TOPIC", "NOTE"]).filter(
    suggestion =>
      node.parentRelations.filter(
        parentRelation => parentRelation.a === suggestion.id
      ).length === 0
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
