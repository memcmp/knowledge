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

export function extractPlainText(node: KnowNode): string {
  const div = document.createElement("div");
  div.innerHTML = node.text;
  return div.textContent as string;
}

export function convertToPlainText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent as string;
}

function addPlainText(node: KnowNode): KnowNodeWithPlainText {
  return {
    ...node,
    plainText: extractPlainText(node)
  };
}

export type SearchboxProps = {
  suggestions: Array<KnowNode | CustomOption>;
  onSelectNode: (node: KnowNode) => void;
  onCreateNode: (text: string) => void;
  onClear?: () => void;
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
  ): void => {
    if (newSelection.length === 0) {
      if (onClear) {
        onClear();
      }
      return;
    }
    const selectedNode = newSelection[0];
    if (isCustomOption(selectedNode)) {
      onCreateNode((selectedNode as CustomOption).plainText);
      return;
    }
    onSelectNode(selectedNode as KnowNode);
  };

  /* eslint-disable react/jsx-props-no-spreading */
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
