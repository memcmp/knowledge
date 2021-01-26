import React, { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import { ReadonlyNode } from "./ReadonlyNode";

function Suggest({
  nodes,
  onAddNodeAbove
}: {
  nodes: Array<KnowNode>;
  onAddNodeAbove: (node: KnowNode) => void;
}): JSX.Element {
  const [selection, setSelection] = useState<Array<KnowNode>>([
    ...nodes.slice(0, 1)
  ]);
  return (
    <>
      <Typeahead
        clearButton
        defaultSelected={selection}
        id="suggest"
        options={nodes}
        onChange={(selection: Array<KnowNode>) => {
          setSelection(selection);
        }}
        labelKey={(option: KnowNode) => {
          const div = document.createElement("div");
          div.innerHTML = option.text;
          return div.textContent as string;
        }}
        renderMenuItemChildren={(option: KnowNode) => {
          return <ReadonlyNode node={option} />;
        }}
      />
      <InputGroup.Append>
        <Button
          variant="outline-primary"
          disabled={selection.length === 0}
          onClick={() => onAddNodeAbove(selection[0])}
        >
          <i className="iconsminds-up d-block" />
        </Button>
      </InputGroup.Append>
    </>
  );
}

export { Suggest };
