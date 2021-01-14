import React from "react";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

type NoteProps = {
  node: KnowNode;
};

function Note({ node }: NoteProps): JSX.Element {
  return (
    <div className="mb-4 col-lg-12 col-xl-6">
      <Card>
        <Card.Body>
          <ReactQuill
            theme="bubble"
            formats={[]}
            modules={{ toolbar: false }}
            value={node.text}
            readOnly={true}
            scrollingContainer=".scrolling-container"
          />
        </Card.Body>
      </Card>
    </div>
  );
}

export { Note };
