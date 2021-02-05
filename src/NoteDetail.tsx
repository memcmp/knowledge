import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import Immutable from "immutable";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { Link, useParams } from "react-router-dom";

import { useAddBucket, useSelectors } from "./DataContext";

import { ReadonlyNode } from "./ReadonlyNode";

import { NoteDetailSuggestions } from "./NoteDetailSuggestion";

import { connectRelevantNodes, newNode } from "./connections";

import { Badge, Collapse } from "react-bootstrap";

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
  nodeID,
  parentNode,
  allowAddTopicBelow,
  showChildren,
  showLink,
  borderBottom
}: {
  nodeID: string;
  parentNode?: KnowNode;
  allowAddTopicBelow?: boolean;
  showChildren?: boolean;
  showLink?: boolean;
  borderBottom: boolean;
}): JSX.Element {
  const [showEdit, setShowEdit] = useState<NodeType | undefined>();
  const [comment, setComment] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const addBucket = useAddBucket();
  const { getObjects, getSubjects, getNode } = useSelectors();
  const quillRef = useRef<ReactQuill>();

  const node = getNode(nodeID);

  const onChange = (content: string) => {
    setComment(content);
  };

  const createNodeAbove = (): void => {
    const above = newNode(comment, showEdit || "NOTE");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(above.id, above)
      .set(node.id, node)
      .merge(parentNode ? { [parentNode.id]: parentNode } : {});
    const connectWithEachOther = connectRelevantNodes(node.id, above.id, nodes);
    const connectWithParentIfExists = parentNode
      ? connectRelevantNodes(parentNode.id, above.id, connectWithEachOther)
      : connectWithEachOther;
    addBucket(connectWithParentIfExists);
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

  const readingSource = parentNode
    ? ["TITLE", "URL"].includes(parentNode.nodeType)
    : false;
  const subNodes = getSubjects(node, undefined, ["RELEVANT"])
    .filter(subject => !(parentNode && subject.id === parentNode.id))
    .filter(
      subject =>
        // needs to be solved differntly
        subject.nodeType === "NOTE" ||
        !(
          readingSource &&
          parentNode &&
          // Only show SubNodes which are related for the parent
          // TODO: think if that's suitable for non source node types
          subject.relationsToObjects.filter(
            relToObj => relToObj.b === parentNode.id
          ).length +
            subject.relationsToSubjects.filter(
              relToSubj => relToSubj.a === parentNode.id
            ).length ===
            0
        )
    );

  // automatically expanad TOPICS and NOTES when reading a source
  const showSubnodes =
    showChildren &&
    ((["TOPIC", "NOTE"].includes(node.nodeType) && readingSource) || showMenu);

  const parentNodes = getObjects(node, undefined, ["RELEVANT"]).filter(
    // remove whenever parent notes are prettier
    p =>
      !(parentNode && p.id === parentNode.id) &&
      !(node.nodeType === "TITLE" && p.nodeType === "NOTE")
  );
  if (quillRef.current && showEdit) {
    quillRef.current.getEditor().root.dataset.placeholder = getPlaceHolder(
      showEdit
    );
  }

  return (
    <>
      <div className={borderBottom ? "border-bottom" : ""}>
        <div className="pt-3">
          {parentNodes.map(p => (
            <Link to={`/notes/${p.id}`}>
              <Badge
                variant={
                  p.nodeType === "TOPIC" ? "outline-info" : "outline-dark"
                }
                className="mr-1"
                pill
                key={p.id}
              >
                {extractPlainText(p)}
              </Badge>
            </Link>
          ))}
        </div>
        <Collapse in={showMenu} mountOnEnter={true}>
          <div>
            <NoteDetailSuggestions
              parentNode={parentNode}
              node={node}
              allowNodeBelow={allowAddTopicBelow && node.nodeType === "TOPIC"}
              onClose={() => {
                setShowEdit(undefined);
                setShowMenu(false);
                setComment("");
              }}
            />
          </div>
        </Collapse>
        <div key={node.id}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: "pointer" }}
          >
            <ReadonlyNode node={node} />
          </div>
        </div>
        <Collapse in={showMenu} mountOnEnter={true}>
          <div>
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
              {showLink && (
                <Link to={`/notes/${node.id}`}>
                  <button
                    className={`header-icon btn btn-empty font-size-toolbar text-semi-muted`}
                  >
                    <i className="simple-icon-link d-block" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </Collapse>

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
        {showChildren && !showSubnodes && subNodes.length > 0 && (
          <div>
            <p className="text-center text-info">({subNodes.length})</p>
          </div>
        )}
      </div>
      {showSubnodes &&
        subNodes.map(sub => (
          <div className="border-bottom ml-4" key={sub.id}>
            <Link to={`/notes/${sub.id}`}>
              <ReadonlyNode node={sub} />
            </Link>
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
  const children = Array.from(
    new Set(
      [
        // For what is this Source Relevant?
        ...(["TITLE", "QUOTE", "URL"].includes(node.nodeType)
          ? // "NOTE" is legacy
            getObjects(node, ["TOPIC", "NOTE"], ["RELEVANT"])
          : []),
        // Relevant for Node
        ...getSubjects(
          node,
          ["TOPIC", "NOTE", "TITLE", "QUOTE"],
          ["RELEVANT", "CONTAINS"]
        ),
        ...getObjects(node, ["QUOTE", "TITLE"], ["CONTAINS"])
      ].map(child => child.id)
    )
  );

  return (
    <>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
            <Card.Body>
              <SubNode
                nodeID={node.id}
                allowAddTopicBelow={true}
                showChildren={false}
                showLink={false}
                borderBottom={false}
              />
            </Card.Body>
          </Card>
        </div>
      </div>
      {children.length > 0 && (
        <div className="row">
          <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
            <Card>
              <Card.Body>
                {children.map((childNode, i) => (
                  <SubNode
                    nodeID={childNode}
                    parentNode={node}
                    key={childNode}
                    allowAddTopicBelow={false}
                    showChildren={true}
                    showLink={true}
                    borderBottom={i + 1 < children.length}
                  />
                ))}
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export { NoteDetail };
