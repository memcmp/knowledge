import React, { useState } from "react";
import ReactQuill from "react-quill";
import Immutable from "immutable";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useParams } from "react-router-dom";

import { useAddBucket, useSelectors } from "./DataContext";

import { v4 } from "uuid";

import { ReadonlyNode } from "./ReadonlyNode";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function SubNode({ childNode }: { childNode: KnowNode }): JSX.Element {
  const [showComment, setShowComment] = useState<boolean>();
  const [comment, setComment] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { getChildren } = useSelectors();
  const addBucket = useAddBucket();

  const onChange = (content: string) => {
    setComment(content);
  };

  const createNote = (onTop: boolean): void => {
    const newNode: KnowNode = {
      id: v4(),
      text: comment,
      nodeType: "NOTE"
    };
    const relations: Relations = [
      {
        relationType: "RELEVANT",
        a: childNode.id,
        b: newNode.id
      }
    ];
    addBucket({
      nodes: Immutable.Map<string, KnowNode>().set(newNode.id, newNode),
      relations
    });
    setShowComment(false);
    setShowMenu(false);
    setComment("");
  };

  const subNodes = getChildren(childNode.id);

  return (
    <div className="border-bottom">
      <div key={childNode.id}>
        <div
          onClick={() => setShowMenu(!showMenu)}
          style={{ cursor: "pointer" }}
        >
          <ReadonlyNode text={childNode.text} />
        </div>
      </div>
      {showMenu && (
        <div className="justify-content-center nav">
          <button
            className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
            type="button"
            onClick={() => setShowComment(!showComment)}
          >
            <i className="simple-icon-speech d-block" />
          </button>
          <button
            className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
            type="button"
          >
            <i className="simple-icon-size-fullscreen d-block" />
          </button>
        </div>
      )}

      {showMenu && showComment && (
        <div className="mb-4">
          <div className="scrolling-container text-muted">
            <ReactQuill
              theme="bubble"
              formats={[]}
              modules={{ toolbar: false }}
              placeholder="Create a Note"
              value={comment}
              onChange={onChange}
              scrollingContainer="scrolling-container"
            />
            {!isEmpty(comment) && (
              <div className="justify-content-center nav">
                <button
                  className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                  type="button"
                  onClick={() => createNote(false)}
                >
                  <i className="iconsminds-down d-block" />
                </button>
                <button
                  className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                  type="button"
                  onClick={() => createNote(true)}
                >
                  <i className="iconsminds-up d-block" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {subNodes.map(sub => (
        <div className="border-top">
          <div className="scrolling-container text-muted">
            <ReadonlyNode text={sub.text} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoteDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { getNode } = useSelectors();
  const { getChildren } = useSelectors();

  const node = getNode(id);
  // TODO: Not found error
  const children = getChildren(id);

  return (
    <>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
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
        </div>
      </div>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
            <Card.Body>
              {children.map(childNode => (
                <SubNode childNode={childNode} key={childNode.id} />
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
}

export { NoteDetail };
