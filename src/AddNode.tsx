import React, { useEffect, useState } from "react";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";

function AddNodeButton({
  setIsWriting
}: {
  setIsWriting: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className="workspace-droppable"
      aria-label="new"
      onClick={() => setIsWriting()}
    >
      <span className="simple-icon-plus mr-2" />
      <span>Add Note, Topic or Source</span>
    </button>
  );
}

function SaveButton(): JSX.Element {
  const [nodeType, setNodeType] = useState<NodeType>("TOPIC");
  const nodeTypeString = `${nodeType.charAt(0)}${nodeType
    .substring(1)
    .toLowerCase()}`;
  return (
    <Dropdown as={ButtonGroup}>
      <Button variant="success">Save {nodeTypeString}</Button>
      <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />
      <Dropdown.Menu>
        <Dropdown.Item onSelect={() => setNodeType("TOPIC")}>
          Topic
        </Dropdown.Item>
        <Dropdown.Item onSelect={() => setNodeType("NOTE")}>Note</Dropdown.Item>
        <Dropdown.Item onSelect={() => setNodeType("URL")}>URL</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function Editor(): JSX.Element {
  const ref = React.createRef<ReactQuill>();
  useEffect(() => {
    (ref.current as ReactQuill).focus();
  }, []);
  return (
    <div className="editor">
      <div className="scrolling-container">
        <ReactQuill
          theme="bubble"
          formats={[]}
          modules={{ toolbar: false }}
          placeholder="Create a Topic, Note or URL"
          scrollingContainer="scrolling-container"
          ref={ref}
        />
      </div>
      <div className="mt-4">
        <SaveButton />
      </div>
    </div>
  );
}

export function AddNode(): JSX.Element {
  const [isWriting, setIsWriting] = useState<boolean>(false);
  return (
    <div>
      {!isWriting && <AddNodeButton setIsWriting={() => setIsWriting(true)} />}
      {isWriting && <Editor />}
    </div>
  );
}
