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

import { useAddBucket } from "./DataContext";

const PARAGRAPH = "<p><br></p>";

function isEmpty(text: string): boolean {
  return text === PARAGRAPH || text === "";
}

function createBucket(paragraphs: Array<string>): Store {
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
  return {
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
  };
}

function CreateNote(): JSX.Element {
  const [text, setText] = useState<string>("");
  const addBuckets = useAddBucket();
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
        const buckets = markdowns.map((markdown: string) => {
          const paragraphs = markdown.split("\n\n");
          return createBucket(
            paragraphs.map((paragraph: string) => {
              const md = new MarkdownIt();
              return md.render(paragraph);
            })
          );
        });
        const mergedBuckets = buckets.reduce(
          (rdx: Store, bucket: Store): Store => {
            return {
              nodes: rdx.nodes.merge(bucket.nodes),
              relations: [...rdx.relations, ...bucket.relations]
            };
          },
          { relations: [], nodes: Immutable.Map() }
        );
        addBuckets(mergedBuckets);
      });
    }
  });
  const onChange = (content: string) => {
    setText(content);
  };

  const onClickSave = (): void => {
    addBuckets(createBucket(text.split(PARAGRAPH)));
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
