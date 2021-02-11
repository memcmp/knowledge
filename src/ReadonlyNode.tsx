import React from "react";
import ReactQuill from "react-quill";

type OnChange = (content: string) => void;

function QuillNode({
  node,
  readOnly,
  onChange
}: {
  node: KnowNode;
  readOnly: boolean;
  onChange?: OnChange;
}): JSX.Element {
  return (
    <div
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
  return <QuillNode node={node} readOnly={false} onChange={onChange} />;
}

export { ReadonlyNode, EditableNode };
