import React from "react";
import ReactQuill from "react-quill";

function ReadonlyNode({ text }: { text: string }): JSX.Element {
  return (
    <ReactQuill
      theme="bubble"
      formats={["link", "size"]}
      modules={{ toolbar: false }}
      value={text}
      readOnly={true}
    />
  );
}

export { ReadonlyNode };
