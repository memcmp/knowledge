import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import Immutable from "immutable";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useParams } from "react-router-dom";

import { useAddBucket, useSelectors } from "./DataContext";

import { ReadonlyNode } from "./ReadonlyNode";

import { NoteDetailSuggestions } from "./NoteDetailSuggestion";

import { connectRelevantNodes, newNode } from "./connections";

import { Badge } from "react-bootstrap";

import { extractPlainText } from "./Searchbox";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function getPlaceHolder(nodeType: NodeType): string | undefined {
  return new Map([
    ["NOTE", "Create a Note"],
    ["TOPIC", "Add Topic"]
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
  const { getObjects, getSubjects } = useSelectors();
  const quillRef = useRef<ReactQuill>();

  const onChange = (content: string) => {
    setComment(content);
  };

  const createNodeAbove = (): void => {
    const above = newNode(comment, showEdit || "NOTE");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(above.id, above)
      .set(parentNode.id, parentNode)
      .set(node.id, node);
    const relToParent = connectRelevantNodes(above.id, parentNode.id, nodes);
    addBucket(connectRelevantNodes(node.id, above.id, relToParent));
    setShowEdit(undefined);
    setShowMenu(false);
    setComment("");
  };

  const createNoteBelow = (): void => {
    const below = newNode(comment, showEdit || "NOTE");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(below.id, below)
      .set(node.id, node);
    addBucket(connectRelevantNodes(below.id, node.id, nodes));
    setShowEdit(undefined);
    setShowMenu(false);
    setComment("");
  };

  const readingSource =
    node.nodeType === "TOPIC" && ["TITLE", "URL"].includes(parentNode.nodeType);
  const subNodes = getSubjects(node)
    .filter(
      subject => subject.id !== parentNode.id
      // don't show subtopics of topics when reading a source
    )
    .filter(
      subNode =>
        !(
          readingSource &&
          node.nodeType === "TOPIC" &&
          subNode.nodeType === "TOPIC"
        )
    );

  const showSubnodes = readingSource || showMenu;

  const parentNodes = getObjects(node).filter(p => p.id !== parentNode.id);
  if (quillRef.current && showEdit) {
    quillRef.current.getEditor().root.dataset.placeholder = getPlaceHolder(
      showEdit
    );
  }

  return (
    <>
      <div className="border-bottom">
        <div className="pt-3">
          {parentNodes.map(p => (
            <Badge variant="outline-info" className="mr-1" pill key={p.id}>
              {extractPlainText(p)}
            </Badge>
          ))}
        </div>
        {showMenu && (
          <NoteDetailSuggestions parentNode={parentNode} node={node} />
        )}
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
      {showSubnodes &&
        subNodes.map(sub => (
          <div className="border-bottom ml-4" key={sub.id}>
            <ReadonlyNode node={sub} />
          </div>
        ))}
    </>
  );
}

function NoteDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { getNode, getSubjects, getObjects } = useSelectors();

  const node = getNode(id);
  // TODO: A filter by relationship type might be better
  const children = [
    ...(["TITLE", "QUOTE", "URL"].includes(node.nodeType)
      ? getObjects(node, ["TOPIC"])
      : []),
    ...getSubjects(node, ["TOPIC", "NOTE"]),
    ...getObjects(node, ["QUOTE", "TITLE"])
  ];

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
