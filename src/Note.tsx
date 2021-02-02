import React from "react";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";
import { Link } from "react-router-dom";

import { ReadonlyNode } from "./ReadonlyNode";

type NoteProps = {
  node: KnowNode;
};

function Note({ node }: NoteProps): JSX.Element {
  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
      <Link to={`/notes/${node.id}`}>
        <Card>
          <Card.Body>
            <ReadonlyNode node={node} />
          </Card.Body>
        </Card>
      </Link>
    </div>
  );
}

export { Note };
