import React, { useState } from "react";
import { Button, Nav, Tab } from "react-bootstrap";
import ReactQuill from "react-quill";
import Card from "react-bootstrap/Card";
import { v4 } from "uuid";
import Immutable from "immutable";
import { useDropzone } from "react-dropzone";
import MarkdownIt from "markdown-it";

import "react-quill/dist/quill.bubble.css";
import "./editor.css";

import { useAddBucket, useSelectors } from "./DataContext";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function createBucket(
  paragraphs: Array<string>
): Store & {
  relationToView: Relation;
} {
  const topParagraph = paragraphs[0];
  const furtherParagraphs = paragraphs.slice(1);

  const topId = v4();

  const relationToView: Relation = {
    relationType: "CONTAINS",
    a: "TIMELINE",
    b: topId
  };

  const bucket: Nodes = Immutable.OrderedMap(
    furtherParagraphs.map((text: string): [string, KnowNode] => {
      const id = v4();
      const relation: Relation = {
        relationType: "CONTAINS",
        a: topId,
        b: id
      };
      return [
        id,
        {
          text,
          nodeType: "QUOTE",
          id,
          relationsToObjects: [],
          relationsToSubjects: [relation]
        }
      ];
    })
  );

  const relationsToObjects: Relations = Array.from(
    bucket
      .map(
        (node: KnowNode): Relation => {
          return node.relationsToSubjects[0];
        }
      )
      .values()
  );
  const topNode: KnowNode = {
    id: topId,
    text: topParagraph,
    nodeType: "TITLE",
    relationsToSubjects: [relationToView],
    relationsToObjects
  };
  return {
    nodes: bucket.set(topNode.id, topNode),
    relationToView
  };
}

function CreateNote(): JSX.Element {
  const [text, setText] = useState<string>("");
  const addBuckets = useAddBucket();
  const { getNode } = useSelectors();
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".md",
    onDrop: (acceptedFiles: Array<File>) => {
      Promise.all(
        acceptedFiles.map(
          (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as string);
              };
              reader.onerror = reject;
              reader.readAsText(file);
            });
          }
        )
      ).then((markdowns: Array<string>) => {
        const nodes = markdowns.reduce(
          (rdx: Immutable.Map<string, KnowNode>, markdown: string) => {
            const timeline = rdx.get("TIMELINE") as KnowNode;
            const paragraphs = markdown.split("\n\n");
            const { nodes, relationToView } = createBucket(
              paragraphs.map((paragraph: string) => {
                const md = new MarkdownIt();
                return md.render(paragraph);
              })
            );
            return rdx
              .set(timeline.id, {
                ...timeline,
                relationsToObjects: [
                  ...timeline.relationsToObjects,
                  relationToView
                ]
              })
              .merge(nodes);
          },
          Immutable.Map<string, KnowNode>().set(
            "TIMELINE",
            getNode("TIMELINE") as KnowNode
          )
        );
        addBuckets(nodes);
      });
    }
  });
  const onChange = (content: string) => {
    setText(content);
  };

  const onClickSave = (): void => {
    const timeline = getNode("TIMELINE");
    const { nodes, relationToView } = createBucket(text.split(PARAGRAPH));
    addBuckets(
      nodes.set(timeline.id, {
        ...timeline,
        relationsToObjects: [...timeline.relationsToObjects, relationToView]
      })
    );
    setText("");
  };

  return (
    <div className="mb-4 col-lg-12 col-xl-6 offset-xl-3">
      <Card>
        <Tab.Container defaultActiveKey="write">
          <Card.Header>
            <Nav variant="tabs" className="card-header-tabs" as="ul">
              <Nav.Item as="li" key="write">
                <Nav.Link eventKey="write" className="nav-link">
                  New
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
              <Tab.Pane key="upload" eventKey="upload">
                <div
                  {...getRootProps({
                    className: "dropzone filepicker dz-clickable"
                  })}
                >
                  <div className="dz-default dz-message">
                    <span>Drop Files here to upload</span>
                  </div>
                  <input {...getInputProps()} />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="write" key="write">
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
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
}

export { CreateNote };
