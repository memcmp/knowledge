import React, { useState } from "react";

import { Searchbox } from "./Searchbox";
import { NewTopicModal } from "./NewTopic";

import { Button, InputGroup } from "react-bootstrap";
import Immutable from "immutable";

import { newNode } from "./connections";

type SelectionState = {
  createNew: boolean;
  value: KnowNode | string;
};

function Suggest({
  nodes,
  onAddNodeAbove,
  onAddNodeBelow
}: {
  nodes: Array<KnowNode>;
  onAddNodeAbove: (node: KnowNode, additionalNodes: Nodes) => void;
  onAddNodeBelow?: (node: KnowNode, additionalNodes: Nodes) => void;
}): JSX.Element {
  const [showNewTopicModal, setShowNewTopicModal] = useState<
    { initialNewTopic: string; above: boolean } | undefined
  >(undefined);
  const [selection, setSelection] = useState<SelectionState | undefined>(
    nodes.length > 0 ? { value: nodes[0], createNew: false } : undefined
  );

  const onClickAddAbove = () => {
    const sel = selection as SelectionState;
    if (sel.createNew) {
      setShowNewTopicModal({
        initialNewTopic: sel.value as string,
        above: true
      });
      return;
    }
    onAddNodeAbove(sel.value as KnowNode, Immutable.Map());
  };

  const onClickAddNodeBelow = () => {
    const sel = selection as SelectionState;
    if (onAddNodeBelow) {
      if (sel.createNew) {
        onAddNodeBelow(newNode(sel.value as string, "TOPIC"), Immutable.Map());
        return;
      }
      // logic commands that it's defined
      onAddNodeBelow(sel.value as KnowNode, Immutable.Map());
    }
  };

  return (
    <>
      {showNewTopicModal !== undefined && (
        <NewTopicModal
          topic={showNewTopicModal.initialNewTopic}
          onHide={() => setShowNewTopicModal(undefined)}
          onCreateNewTopic={(topic: KnowNode, additionalNodes: Nodes) => {
            if (showNewTopicModal.above) {
              onAddNodeAbove(topic, additionalNodes);
            } else if (onAddNodeBelow) {
              onAddNodeBelow(topic, additionalNodes);
            }
            setShowNewTopicModal(undefined);
          }}
        />
      )}
      <Searchbox
        suggestions={nodes}
        onSelectNode={(node: KnowNode) =>
          setSelection({ value: node, createNew: false })
        }
        onCreateNode={(node: string) =>
          setSelection({ value: node, createNew: true })
        }
        onClear={() => setSelection(undefined)}
      />
      <InputGroup.Append>
        <Button
          variant="outline-primary"
          disabled={selection === undefined}
          onClick={() => onClickAddAbove()}
        >
          <i className="iconsminds-up d-block" />
        </Button>
        {onAddNodeBelow && (
          <Button
            variant="outline-primary"
            disabled={selection === undefined}
            onClick={() => onClickAddNodeBelow()}
          >
            <i className="iconsminds-down d-block" />
          </Button>
        )}
      </InputGroup.Append>
    </>
  );
}

export { Suggest };
