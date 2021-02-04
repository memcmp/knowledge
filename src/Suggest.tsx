import React, { useState } from "react";

import { Searchbox } from "./Searchbox";
import { NewTopicModal } from "./NewTopic";

import { Button, InputGroup } from "react-bootstrap";
import Immutable from "immutable";

type SelectionState = {
  createNew: boolean;
  value: KnowNode | string;
};

function Suggest({
  nodes,
  onAddNodeAbove
}: {
  nodes: Array<KnowNode>;
  onAddNodeAbove: (node: KnowNode, additionalNodes: Nodes) => void;
}): JSX.Element {
  const [showNewTopicModal, setShowNewTopicModal] = useState<
    string | undefined
  >(undefined);
  const [selection, setSelection] = useState<SelectionState | undefined>(
    nodes.length > 0 ? { value: nodes[0], createNew: false } : undefined
  );

  const onClickAddAbove = () => {
    const sel = selection as SelectionState;
    if (sel.createNew) {
      setShowNewTopicModal(sel.value as string);
      return;
    }
    onAddNodeAbove(sel.value as KnowNode, Immutable.Map());
  };

  return (
    <>
      {showNewTopicModal !== undefined && (
        <NewTopicModal
          topic={showNewTopicModal}
          onHide={() => setShowNewTopicModal(undefined)}
          onCreateNewTopic={(topic: KnowNode, additionalNodes: Nodes) => {
            onAddNodeAbove(topic, additionalNodes);
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
      </InputGroup.Append>
    </>
  );
}

export { Suggest };
