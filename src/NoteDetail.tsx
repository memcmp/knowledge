import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import Immutable from "immutable";
import Card from "react-bootstrap/Card";
import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { Link, useParams } from "react-router-dom";

import { Badge, Collapse } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { useAddBucket, useSelectors } from "./DataContext";

import { EditableNode, ReadonlyNode } from "./ReadonlyNode";

import { NoteDetailSuggestions } from "./NoteDetailSuggestion";

import {
  connectRelevantNodes,
  newNode,
  createContext,
  moveRelations
} from "./connections";

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
  showChildren: boolean;
  showLink?: boolean;
  borderBottom: boolean;
}): JSX.Element {
  const [showEdit, setShowEdit] = useState<NodeType | undefined>();
  const [comment, setComment] = useState<string>("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [editingText, setEditingText] = useState<string>("");
  const addBucket = useAddBucket();
  const { getObjects, getSubjects, getNode } = useSelectors();
  const quillRef = useRef<ReactQuill>();

  const node = getNode(nodeID);

  const onChange = (content: string): void => {
    setComment(content);
  };

  const closeEditMenu = (): void => {
    setShowEdit(undefined);
    setShowMenu(false);
    setComment("");
  };

  const createNodeAbove = (): void => {
    const above = newNode(comment, showEdit || "NOTE");
    const context = createContext(Immutable.Map())
      .set(above)
      .set(node)
      .connectRelevant(node.id, above.id);
    if (parentNode) {
      addBucket(
        context.set(parentNode).connectRelevant(parentNode.id, above.id).nodes
      );
    } else {
      addBucket(context.nodes);
    }
    closeEditMenu();
  };

  const createNoteBelow = (): void => {
    const below = newNode(comment, showEdit || "NOTE");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(below.id, below)
      .set(node.id, node);
    addBucket(connectRelevantNodes(below.id, node.id, nodes));
    closeEditMenu();
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
          ).size +
            subject.relationsToSubjects.filter(
              relToSubj => relToSubj.a === parentNode.id
            ).size ===
            0
        )
    );
  const expandSubNodes = showChildren && (showMenu || editing);
  const parentNodes = [
    ...getObjects(node, undefined, ["RELEVANT"]),
    ...getSubjects(node, ["VIEW"], ["CONTAINS"])
  ].filter(
    p =>
      !(parentNode && p.id === parentNode.id) &&
      !(node.nodeType === "TITLE" && p.nodeType === "NOTE")
  );
  if (quillRef.current && showEdit) {
    quillRef.current.getEditor().root.dataset.placeholder = getPlaceHolder(
      showEdit
    );
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  /* eslint-disable react/no-array-index-key */
  return (
    <>
      <div className={borderBottom ? "border-bottom" : ""}>
        <div className="pt-3">
          {parentNodes.map((p, i) => (
            <Link to={`/notes/${p.id}`} key={`${p.id}-${i}`}>
              <Badge
                variant={
                  p.nodeType === "TOPIC" ? "outline-info" : "outline-dark"
                }
                className="mr-1"
                pill
              >
                {extractPlainText(p)}
              </Badge>
            </Link>
          ))}
        </div>
        <Collapse in={showMenu || editing} mountOnEnter>
          <div>
            <NoteDetailSuggestions
              parentNode={parentNode}
              node={node}
              allowNodeBelow={
                allowAddTopicBelow && ["TOPIC", "NOTE"].includes(node.nodeType)
              }
              onClose={closeEditMenu}
            />
          </div>
        </Collapse>
        <div key={node.id}>
          <div
            onClick={() => {
              if (!editing) {
                setShowMenu(!showMenu);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {!editing && <ReadonlyNode node={node} />}
            {editing && (
              <EditableNode
                node={{
                  ...node,
                  text: editingText
                }}
                onChange={(text: string) => setEditingText(text)}
              />
            )}
          </div>
        </div>
        <Collapse in={showMenu} mountOnEnter>
          <div>
            {!editing && (
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
                  className={`header-icon btn btn-empty font-size-toolbar text-semi-muted ${
                    editing ? "text-primary" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setEditing(!editing);
                  }}
                >
                  <i className="simple-icon-pencil d-block" />
                </button>
                {showLink && (
                  <Link to={`/notes/${node.id}`}>
                    <button
                      type="button"
                      className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                    >
                      <i className="simple-icon-link d-block" />
                    </button>
                  </Link>
                )}
              </div>
            )}
            {editing && (
              <div className="justify-content-center nav">
                <button
                  className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                  type="button"
                  onClick={() => {
                    setEditing(false);
                  }}
                >
                  <i className="simple-icon-ban d-block" />
                </button>
                {!isEmpty(editingText) && (
                  <button
                    className="header-icon btn btn-empty font-size-toolbar text-semi-muted"
                    type="button"
                    onClick={() => {
                      addBucket(
                        Immutable.Map({
                          [node.id]: {
                            ...node,
                            text: editingText
                          }
                        })
                      );
                      setEditing(false);
                      setShowMenu(false);
                    }}
                  >
                    <i className="simple-icon-check d-block" />
                  </button>
                )}
              </div>
            )}
          </div>
        </Collapse>

        {showMenu && showEdit && (
          <div className="mb-4">
            <div className="scrolling-container">
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
        {showChildren && !expandSubNodes && subNodes.length > 0 && (
          <div>
            <p className="text-center text-info">({subNodes.length})</p>
          </div>
        )}
      </div>
      {expandSubNodes &&
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

type SectionProps = {
  title: string;
  childNodes: Array<string>;
  parentNode: KnowNode;
};

type SortableSectionProps = SectionProps & {
  onSortEnd: (props: { oldIndex: number; newIndex: number }) => void;
};

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
function SortableSection({
  title,
  onSortEnd,
  childNodes,
  parentNode
}: SortableSectionProps): JSX.Element {
  return (
    <div className="row">
      <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
        <Card>
          <Card.Body>
            <Card.Title>{title}</Card.Title>
            <DragDropContext
              onDragEnd={result => {
                if (result.destination) {
                  onSortEnd({
                    oldIndex: result.source.index,
                    newIndex: result.destination.index
                  });
                }
              }}
            >
              <Droppable droppableId="droppable">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {childNodes.map((childNode, i) => (
                      <Draggable
                        key={childNode}
                        draggableId={childNode}
                        index={i}
                      >
                        {providedDraggable => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            style={providedDraggable.draggableProps.style}
                          >
                            <SubNode
                              nodeID={childNode}
                              parentNode={parentNode}
                              allowAddTopicBelow={false}
                              showChildren
                              showLink
                              borderBottom={i + 1 < childNodes.length}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
/* eslint-enable react/jsx-props-no-spreading */

function Section({ title, childNodes, parentNode }: SectionProps): JSX.Element {
  return (
    <div className="row">
      <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
        <Card>
          <Card.Body>
            <Card.Title>{title}</Card.Title>
            {childNodes.map((childNode, i) => (
              <SubNode
                key={childNode}
                nodeID={childNode}
                parentNode={parentNode}
                borderBottom={i + 1 < childNodes.length}
                showChildren
              />
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

function NoteDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { getNode, getSubjects, getObjects } = useSelectors();
  const addBucket = useAddBucket();
  const node = getNode(id);
  const relevantSubjects = Array.from(
    new Set(
      getSubjects(
        node,
        ["TOPIC", "NOTE", "TITLE", "QUOTE"],
        ["RELEVANT", "CONTAINS"]
      ).map(child => child.id)
    )
  );

  const relevantObjects = Array.from(
    new Set(
      (["TITLE", "QUOTE", "URL"].includes(node.nodeType)
        ? // "NOTE" is legacy
          getObjects(node, ["TOPIC", "NOTE"], ["RELEVANT"])
        : []
      ).map(child => child.id)
    )
  );
  const containsObjects = Array.from(
    new Set(
      getObjects(node, ["QUOTE", "TITLE"], ["CONTAINS"]).map(child => child.id)
    )
  );

  return (
    <>
      <div className="row">
        <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
          <Card>
            <Card.Body className="header">
              <SubNode
                nodeID={node.id}
                allowAddTopicBelow
                showChildren={false}
                showLink={false}
                borderBottom={false}
              />
            </Card.Body>
          </Card>
        </div>
      </div>
      {relevantSubjects.length > 0 && (
        <SortableSection
          title="Relevant Subjects"
          childNodes={relevantSubjects}
          parentNode={node}
          onSortEnd={({
            oldIndex,
            newIndex
          }: {
            oldIndex: number;
            newIndex: number;
          }) => {
            addBucket(
              Immutable.Map({
                [node.id]: {
                  ...node,
                  relationsToSubjects: moveRelations(
                    relevantSubjects,
                    node.relationsToSubjects,
                    oldIndex,
                    newIndex
                  )
                }
              })
            );
          }}
        />
      )}
      {relevantObjects.length > 0 && (
        <Section
          title="Source is relevant for"
          childNodes={relevantObjects}
          parentNode={node}
        />
      )}
      {containsObjects.length > 0 && (
        <Section
          title="Quotes"
          childNodes={containsObjects}
          parentNode={node}
        />
      )}
    </>
  );
}

export { NoteDetail };
