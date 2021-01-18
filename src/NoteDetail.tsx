import React from "react";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useParams } from "react-router-dom";

import { useSelectors } from "./DataContext";

function NoteDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { getNode } = useSelectors();
  const { getChildren } = useSelectors();

  const node = getNode(id);
  // TODO: Not found error
  const children = getChildren(id);
  console.log(children);

  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
      <Card>
        <Card.Body>
          <ReactQuill
            theme="bubble"
            formats={[]}
            modules={{ toolbar: false }}
            value={node.text}
            readOnly={true}
          />
          {children.map(childNode => (
            <div className="border-bottom" key={childNode.id}>
              <ReactQuill
                theme="bubble"
                formats={[]}
                modules={{ toolbar: false }}
                value={childNode.text}
                readOnly={true}
              />
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
}

export { NoteDetail };
