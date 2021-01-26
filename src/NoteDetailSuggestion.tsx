import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useAddBucket, useSelectors } from "./DataContext";
import { Suggest } from "./Suggest";
import Immutable from "immutable";

function NoteDetailSuggestions({
  node,
  parentNode
}: {
  parentNode: KnowNode;
  node: KnowNode;
}): JSX.Element {
  const addBucket = useAddBucket();
  const { getChildren } = useSelectors();

  const insertNodeAbove = (insertNode: KnowNode): void => {
    const relationToNode: Relation = {
      relationType: "RELEVANT",
      a: insertNode.id,
      b: node.id
    };
    // Assume the new node has already a relation to the parent
    const updatedNode = {
      ...node,
      parentRelations: [...node.parentRelations, relationToNode]
    };
    const updatedInsertNode = {
      ...insertNode,
      childRelations: [...insertNode.childRelations, relationToNode]
    };
    addBucket(
      Immutable.Map<string, KnowNode>()
        .set(updatedNode.id, updatedNode)
        .set(updatedInsertNode.id, updatedInsertNode)
    );
  };

  const suggestions = getChildren(parentNode, [
    "TOPIC",
    "QUESTION",
    "NOTE"
  ]).filter(
    suggestion =>
      node.parentRelations.filter(
        parentRelation => parentRelation.a === suggestion.id
      ).length === 0
  );
  if (suggestions.length === 0) {
    return <></>;
  }

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
            onAddNodeAbove={(insertNode: KnowNode) => {
              insertNodeAbove(insertNode);
            }}
          />
        </InputGroup>
      </Form.Group>
    </div>
  );
}

export { NoteDetailSuggestions };
