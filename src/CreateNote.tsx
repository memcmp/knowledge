import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import { v4 } from "uuid";
import Immutable from "immutable";

import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useAddBucket } from "./DataContext";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function CreateNote(): JSX.Element {
  const [text, setText] = useState<string>("");
  const addBuckets = useAddBucket();
  const onChange = (content: string) => {
    setText(content);
  };

  const onClickSave = (): void => {
    const paragraphs = text.split(PARAGRAPH);
    const topParagraph = paragraphs[0];
    const furtherParagraphs = paragraphs.slice(1);
    const topNode: KnowNode = {
      id: v4(),
      text: topParagraph,
      nodeType: "URL"
    };
    const children = furtherParagraphs.map(
      (text: string): KnowNode => {
        return {
          text,
          nodeType: "QUOTE",
          id: v4()
        };
      }
    );
    addBuckets({
      nodes: Immutable.Map(children.map(child => [child.id, child])).set(
        topNode.id,
        topNode
      ),
      relations: [
        {
          relationType: "CONTAINS",
          a: "TIMELINE",
          b: topNode.id
        },
        ...children.map(
          (child: KnowNode): Relation => {
            return {
              relationType: "CONTAINS",
              a: topNode.id,
              b: child.id
            };
          }
        )
      ]
    });

    setText("");
  };

  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
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
