import React from "react";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";
import { Link } from "react-router-dom";

type NoteProps = {
  node: KnowNode;
};

function Note({ node }: NoteProps): JSX.Element {
  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
      <Link to={`/notes/${node.id}`}>
        <Card>
          <Card.Body>
            <ReactQuill
              theme="bubble"
              formats={["link", "header"]}
              modules={{ toolbar: false }}
              value={node.text}
              readOnly={true}
            />
          </Card.Body>
        </Card>
      </Link>
    </div>
  );
}

export { Note };
