import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import Immutable from "immutable";
import { useUpsertNodes, useSelectors, Selectors } from "./DataContext";
import { Suggest } from "./Suggest";

import { connectRelevantNodes } from "./connections";

// memoize
export function getSuggestions(
  selectors: Selectors,
  forNode: KnowNode,
  parentNode?: KnowNode
): Array<KnowNode> {
  const { getObjects, getSubjects, getAllNodesByType, getNode } = {
    ...selectors
  };
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

  const closeSuggestions = findSuggestions(parentNode || forNode, 3);
  const otherSuggestions = getAllNodesByType(["TOPIC"]).map(topic => topic.id);
  const existingSuggestions = getObjects(forNode, ["TOPIC"]).map(
    topic => topic.id
  );
  return Array.from(
    new Set([
      ...closeSuggestions,
      ...otherSuggestions,
      // This can be done more efficient
      ...getAllNodesByType(["TITLE", "NOTE", "VIEW"]).map(note => note.id)
    ])
  )
    .filter(id => !existingSuggestions.includes(id) && id !== forNode.id)
    .map(id => getNode(id));
}

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
  const upsertNodes = useUpsertNodes();
  const selectors = useSelectors();

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
    upsertNodes(connectWithParentIfExists);
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
    upsertNodes(connect);
    onClose();
  };

  // TODO: Memoize ?
  const suggestions = getSuggestions(selectors, node, parentNode);

  return (
    <div>
      <Form.Group>
        <InputGroup className="input-group-sm mt-4">
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
