import React, { useState } from "react";
import { Button, Nav, Tab } from "react-bootstrap";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import Immutable from "immutable";

import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useUpsertNodes, useSelectors } from "./DataContext";

import { INTERESTS, TIMELINE } from "./storage";

import {
  connectContainingNodes,
  connectRelevantNodes,
  newNode
} from "./connections";

const PARAGRAPH = "<p><br></p>";

export function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function CreateNote(): JSX.Element {
  const [text, setText] = useState<string>("");
  const upsertNodes = useUpsertNodes();
  const { getNode } = useSelectors();
  const onChange = (content: string): void => {
    setText(content);
  };

  const onClickCreateNote = (): void => {
    const timeline = getNode(TIMELINE);
    const note = newNode(text, "NOTE");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(timeline.id, timeline)
      .set(note.id, note);
    upsertNodes(connectContainingNodes(timeline.id, note.id, nodes));
    setText("");
  };

  const onClickCreateTopic = (): void => {
    const interests = getNode(INTERESTS);
    const topic = newNode(text, "TOPIC");
    const nodes = Immutable.Map<string, KnowNode>()
      .set(interests.id, interests)
      .set(topic.id, topic);
    upsertNodes(connectRelevantNodes(topic.id, interests.id, nodes));
    setText("");
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
      <Card>
        <Tab.Container defaultActiveKey="createNote">
          <Card.Header>
            <Nav variant="tabs" className="card-header-tabs" as="ul">
              <Nav.Item as="li" key="createNote">
                <Nav.Link eventKey="createNote" className="nav-link">
                  New Note
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" key="createTopic">
                <Nav.Link eventKey="createTopic" className="nav-link">
                  New Topic
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" key="upload">
                <Nav.Link eventKey="upload" className="nav-link">
                  Upload Markdown
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="pl-2">
            <Tab.Content>
              <Tab.Pane eventKey="createNote" key="createNote">
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
                      onClick={onClickCreateNote}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="createTopic" key="createTopic">
                <div className="scrolling-container">
                  <ReactQuill
                    theme="bubble"
                    formats={[]}
                    modules={{ toolbar: false }}
                    placeholder="Create a Topic"
                    value={text}
                    onChange={onChange}
                    scrollingContainer="scrolling-container"
                  />
                  <div className="mt-4">
                    <Button
                      variant="success"
                      className="float-right"
                      disabled={isEmpty(text)}
                      onClick={onClickCreateTopic}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
}

export { CreateNote };
