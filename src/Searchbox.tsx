import React from "react";

import { Typeahead } from "react-bootstrap-typeahead";

import { ReadonlyNode } from "./ReadonlyNode";

type CustomOption = {
  customOption: boolean;
  plainText: string;
};

type KnowNodeWithPlainText = KnowNode & {
  plainText: string;
};

function addPlainText(node: KnowNode): KnowNodeWithPlainText {
  const div = document.createElement("div");
  div.innerHTML = node.text;
  return {
    ...node,
    plainText: div.textContent as string
  };
}

export type SearchboxProps = {
  suggestions: Array<KnowNode | CustomOption>;
  onSelectNode: (node: KnowNode) => void;
  onCreateNode: (text: string) => void;
  onClear: () => void;
};

function isCustomOption(option: CustomOption | KnowNode): boolean {
  return (option as CustomOption).customOption;
}

function Searchbox({
  suggestions,
  onSelectNode,
  onCreateNode,
  onClear
}: SearchboxProps): JSX.Element {
  const nodesWithPlainText = suggestions.map(node =>
    isCustomOption(node)
      ? (node as CustomOption)
      : addPlainText(node as KnowNode)
  );
  const defaultSelected = nodesWithPlainText.slice(0, 1);

  // This is a hack cause newSelectionPrefix is not supported in the ts types
  const extraProps = { newSelectionPrefix: "New Topic:" };

  const onChange = (
    newSelection: Array<KnowNodeWithPlainText | CustomOption>
  ) => {
    if (newSelection.length === 0) {
      onClear();
      return;
    }
    const selectedNode = newSelection[0];
    if (isCustomOption(selectedNode)) {
      onCreateNode((selectedNode as CustomOption).plainText);
      return;
    }
    onSelectNode(selectedNode as KnowNode);
  };

  return (
    <>
      <Typeahead
        {...extraProps}
        clearButton
        allowNew
        defaultSelected={defaultSelected}
        id="suggest"
        options={nodesWithPlainText
          .filter(node => !isCustomOption(node))
          .map(node => node as KnowNodeWithPlainText)}
        onChange={onChange}
        labelKey="plainText"
        renderMenuItemChildren={(
          option: KnowNodeWithPlainText | CustomOption
        ) => {
          // We can cast here, cause we filter custom nodes out in the option
          return <ReadonlyNode node={option as KnowNodeWithPlainText} />;
        }}
      />
    </>
  );
}

export { Searchbox };
