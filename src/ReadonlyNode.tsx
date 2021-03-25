import React, { useEffect } from "react";
import ReactQuill from "react-quill";

type OnChange = (content: string) => void;

function QuillNode({
  node,
  readOnly,
  onChange,
  ariaLabel
}: {
  node: KnowNode;
  readOnly: boolean;
  onChange?: OnChange;
  ariaLabel?: string;
}): JSX.Element {
  return (
    <div aria-label={ariaLabel}>
      <ReactQuill
        theme="bubble"
        formats={["link", "size"]}
        modules={{ toolbar: false }}
        value={node.text}
        readOnly={readOnly}
        onChange={onChange}
      />
    </div>
  );
}

function ReadonlyNode({ node }: { node: KnowNode }): JSX.Element {
  return <QuillNode readOnly node={node} />;
}

function EditableNode({
  node,
  onChange
}: {
  node: KnowNode;
  onChange: OnChange;
}): JSX.Element {
  const ref = React.createRef<ReactQuill>();
  useEffect(() => {
    (ref.current as ReactQuill).focus();
    (ref.current as ReactQuill).getEditor().setSelection(node.text.length, 0);
  }, []);
  return (
    <div
      aria-label="text-editor"
      className={`scrolling-container ${
        ["TOPIC", "TITLE"].includes(node.nodeType) ? "lead" : ""
      }
            ${node.nodeType === "TOPIC" ? "text-info" : ""}
            ${node.nodeType === "NOTE" ? "" : ""}
            ${node.nodeType === "QUOTE" ? "quote" : ""}
              `}
    >
      <ReactQuill
        theme="bubble"
        formats={["link", "size"]}
        modules={{ toolbar: false }}
        value={node.text}
        onChange={onChange}
        ref={ref}
      />
    </div>
  );
}

export { ReadonlyNode, EditableNode };
