import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import Immutable from "immutable";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";
import { Nav, Tab, TabPane } from "react-bootstrap";

import { useParams } from "react-router-dom";

import { useAddBucket, useSelectors } from "./DataContext";

import { ReadonlyNode } from "./ReadonlyNode";

import { NoteDetailSuggestions } from "./NoteDetailSuggestion";

import { connectRelevantNodes, newNode } from "./connections";

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

  const subNodes = getSubjects(node).filter(
    subject => subject.id !== parentNode.id
  );
  const parentNodes = getObjects(node).filter(p => p.id !== parentNode.id);

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

  const topicchildren = getSubjects(node, ["TOPIC"])
  const quotechildren = getObjects(node, ["QUOTE"])
  
  return (
    <>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
          <Tab.Container defaultActiveKey="quotes">
            <Card.Header>
            <Nav variant="tabs" className="card-header-all" as="ul">
              <Nav.Item as="li" key="all">
                <Nav.Link eventKey="all" className="nav-link">
                  See All
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" key="topics">
                <Nav.Link eventKey="topics" className="nav-link" >
                  Topics 
              </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" key="quotes">
                <Nav.Link eventKey="quotes" className="nav-link">
                  Quotes
                </Nav.Link>
              </Nav.Item>
            </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <TabPane eventKey="all" key="all">
                {children.map(childNode => (
                <SubNode
                  node={childNode}
                  parentNode={node}
                  key={childNode.id}
                />
              ))}
             </TabPane>
             <TabPane eventKey="topics" key="topics">
             {topicchildren.map(childNode => (
                <SubNode
                  node={childNode}
                  parentNode={node}
                  key={childNode.id}
                />
              ))}
             </TabPane>
             <TabPane eventKey="quotes" key="quotes">
             {quotechildren.map(childNode => (
                <SubNode
                  node={childNode}
                  parentNode={node}
                  key={childNode.id}
                />
              ))}
             </TabPane>
             </Tab.Content>
            </Card.Body>
            </Tab.Container>
          </Card>
        </div>
      </div>
    </>
  );
}

export { NoteDetail };
