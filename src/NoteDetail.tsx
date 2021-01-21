import React, { useState, useRef } from "react";
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

function getPlaceHolder(nodeType: NodeType): string | undefined {
  return new Map([
    ["NOTE", "Create a Note"],
    ["TOPIC", "Add Topic"],
    ["QUESTION", "Ask a Question"]
  ]).get(nodeType);
}

function SubNode({
  node,
  parentNode
}: {
  node: KnowNode;
  parentNode: KnowNode;
}): JSX.Element {
  const [showEdit, setShowEdit] = useState<NodeType | undefined>();
  const [comment, setComment] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const addBucket = useAddBucket();
  const { getChildren, getNode } = useSelectors();
  const quillRef = useRef<ReactQuill>();

  const onChange = (content: string) => {
    setComment(content);
  };

  const createNodeAbove = (): void => {
    const id = v4();
    const relationToNode: Relation = {
      relationType: "RELEVANT",
      a: id,
      b: node.id
    };
    const relationToParent: Relation = {
      relationType: "RELEVANT",
      a: parentNode.id,
      b: id
    };
    const newNode: KnowNode = {
      id,
      text: comment,
      nodeType: showEdit || "NOTE",
      parentRelations: [relationToParent],
      childRelations: [relationToNode]
    };
    const updatedNode = {
      ...node,
      parentRelations: [...node.parentRelations, relationToNode]
    };
    const updatedParent = {
      ...parentNode,
      childRelations: [relationToParent, ...parentNode.childRelations]
    };
    addBucket(
      Immutable.Map<string, KnowNode>()
        .set(newNode.id, newNode)
        .set(updatedNode.id, updatedNode)
        .set(updatedParent.id, updatedParent)
    );
    setShowEdit(undefined);
    setShowMenu(false);
    setComment("");
  };

  const createNoteBelow = (): void => {
    const id = v4();
    const relation: Relation = {
      relationType: "RELEVANT",
      a: node.id,
      b: id
    };
    const newNode: KnowNode = {
      id: v4(),
      text: comment,
      nodeType: showEdit || "NOTE",
      parentRelations: [relation],
      childRelations: []
    };
    const updatedWithComment = {
      ...node,
      childRelations: [...node.childRelations, relation]
    };
    addBucket(
      Immutable.Map<string, KnowNode>()
        .set(updatedWithComment.id, updatedWithComment)
        .set(id, newNode)
    );
    setShowEdit(undefined);
    setShowMenu(false);
    setComment("");
  };

  const subNodes = getChildren(node);
  const parentNodes = node.parentRelations
    .filter(rel => rel.a !== parentNode.id)
    .map(rel => getNode(rel.a));

  // TODO: Highlight current button
  if (quillRef.current && showEdit) {
    quillRef.current.getEditor().root.dataset.placeholder = getPlaceHolder(
      showEdit
    );
  }

  return (
    <>
      {parentNodes.map(p => (
        <div className="border-bottom" style={{ marginLeft: -10 }} key={p.id}>
          <ReadonlyNode node={p} />
        </div>
      ))}
      <div className="border-bottom">
        <div key={node.id}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: "pointer" }}
          >
            <ReadonlyNode node={node} />
          </div>
        </div>
        {showMenu && (
          <div className="justify-content-center nav">
            <button
              className={`header-icon btn btn-empty font-size-toolbar text-semi-muted ${
                showEdit === "NOTE" ? "text-primary" : ""
              }`}
              type="button"
              onClick={() =>
                setShowEdit(showEdit === "NOTE" ? undefined : "NOTE")
              }
            >
              <i className="simple-icon-speech d-block" />
            </button>
            <button
              type="button"
              className={`header-icon btn btn-empty font-size-toolbar text-semi-muted ${
                showEdit === "QUESTION" ? "text-primary" : ""
              }`}
              onClick={() =>
                setShowEdit(showEdit === "QUESTION" ? undefined : "QUESTION")
              }
            >
              <i className="simple-icon-question d-block" />
            </button>
            <button
              className={`header-icon btn btn-empty font-size-toolbar text-semi-muted ${
                showEdit === "TOPIC" ? "text-primary" : ""
              }`}
              type="button"
              onClick={() =>
                setShowEdit(showEdit === "TOPIC" ? undefined : "TOPIC")
              }
            >
              <i className="simple-icon-social-tumblr d-block" />
            </button>
          </div>
        )}

        {showMenu && showEdit && (
          <div className="mb-4">
            <div className="scrolling-container text-muted">
              <ReactQuill
                theme="bubble"
                formats={[]}
                modules={{ toolbar: false }}
                placeholder={getPlaceHolder(showEdit)}
                value={comment}
                onChange={onChange}
                scrollingContainer="scrolling-container"
                ref={el => {
                  quillRef.current = el as ReactQuill;
                }}
              />
              {!isEmpty(comment) && (
                <div className="justify-content-center nav">
                  <button
                    className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                    type="button"
                    onClick={() => createNoteBelow()}
                  >
                    <i className="iconsminds-down d-block" />
                  </button>
                  <button
                    className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                    type="button"
                    onClick={() => createNodeAbove()}
                  >
                    <i className="iconsminds-up d-block" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {subNodes.map(sub => (
        <div className="border-bottom ml-4" key={sub.id}>
          <ReadonlyNode node={sub} />
        </div>
      ))}
    </>
  );
}

function NoteDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { getNode, getChildren } = useSelectors();

  const node = getNode(id);
  const children = getChildren(node);

  return (
    <>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
            <Card.Body>
              <ReadonlyNode node={node} />
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
            <Card.Body>
              {children.map(childNode => (
                <SubNode
                  node={childNode}
                  parentNode={node}
                  key={childNode.id}
                />
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
}

export { NoteDetail };
