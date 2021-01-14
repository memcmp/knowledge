import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";

import "react-quill/dist/quill.bubble.css";
import "./editor.css";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

type CreateNoteProps = {
  onCreateNode: (relations: Relations) => void;
};

function CreateNote({ onCreateNode }: CreateNoteProps): JSX.Element {
  const [text, setText] = useState<string>("");
  const onChange = (content: string) => {
    setText(content);
  };

  const onClickSave = (): void => {
    const paragraphs = text.split(PARAGRAPH);
    const topParagraph = paragraphs[0];
    const furtherParagraphs = paragraphs.slice(1);
    const topNode: KnowNode = {
      text: topParagraph,
      nodeType: "URL"
    };
    const children = furtherParagraphs.map(
      (text: string): KnowNode => {
        return {
          text,
          nodeType: "QUOTE"
        };
      }
    );
    onCreateNode([
      {
        relationType: "CONTAINS",
        a: {
          nodeType: "VIEW",
          text: "TIMELINE"
        },
        b: topNode
      },
      ...children.map(
        (child: KnowNode): Relation => {
          return {
            relationType: "CONTAINS",
            a: topNode,
            b: child
          };
        }
      )
    ]);
    setText("");
  };

  return (
    <div className="mb-4 col-lg-12 col-xl-6">
      <Card>
        <Card.Body>
          <div className="scrolling-container">
            <ReactQuill
              theme="bubble"
              formats={[]}
              modules={{ toolbar: false }}
              placeholder="Create a Note"
              value={text}
              onChange={onChange}
              scrollingContainer="scrolling-container"
            />
            <div className="mt-4">
              <Button
                variant="success"
                className="float-right"
                disabled={isEmpty(text)}
                onClick={onClickSave}
              >
                Save
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export { CreateNote };
