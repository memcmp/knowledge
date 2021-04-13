import React, { useEffect, useState } from "react";
import Immutable from "immutable";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";
import { Typeahead, Menu, MenuItem } from "react-bootstrap-typeahead";

import { useNodes, useUpdateWorkspace, useWorkspace } from "./DataContext";

import { newNode } from "./connections";

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

type SaveButtonProps = {
  onSave: (nodeType: NodeType) => void;
};

function SaveButton({ onSave }: SaveButtonProps): JSX.Element {
  const [nodeType, setNodeType] = useState<NodeType>("TOPIC");
  const nodeTypeString = `${nodeType.charAt(0)}${nodeType
    .substring(1)
    .toLowerCase()}`;
  return (
    <Dropdown as={ButtonGroup}>
      <Button
        variant="success"
        onClick={() => {
          onSave(nodeType);
        }}
      >
        Save {nodeTypeString}
      </Button>
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

type EditorProps = {
  initialValue: string;
  onCreateNode: (text: string, nodeType: NodeType) => void;
};

function Editor({ initialValue, onCreateNode }: EditorProps): JSX.Element {
  const ref = React.createRef<ReactQuill>();
  useEffect(() => {
    (ref.current as ReactQuill).getEditor().setText(initialValue);
    (ref.current as ReactQuill).focus();
    (ref.current as ReactQuill)
      .getEditor()
      .setSelection(initialValue.length, 0);
  }, []);
  const onSave = (nodeType: NodeType): void => {
    if (!ref.current) {
      return;
    }
    onCreateNode(ref.current.getEditor().getText(), nodeType);
  };
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
        <SaveButton onSave={onSave} />
      </div>
    </div>
  );
}

const NODE_TYPE_SORTING: Array<NodeType> = [
  "TOPIC",
  "TITLE",
  "URL",
  "NOTE",
  "QUOTE"
];

type SearchProps = {
  switchToNew: (initial: string) => void;
};

/* eslint-disable react/jsx-props-no-spreading */
function Search({ switchToNew }: SearchProps): JSX.Element {
  const ref = React.createRef<Typeahead<KnowNode>>();
  const menuEnd = React.createRef<HTMLDivElement>();
  const nodes = useNodes();
  // TODO: sort by type
  const options = Immutable.List(nodes.values())
    .sort((a: KnowNode, b: KnowNode): number => {
      const idxA: number = NODE_TYPE_SORTING.findIndex(
        nodeType => nodeType === a.nodeType
      );
      const idxB: number = NODE_TYPE_SORTING.findIndex(
        nodeType => nodeType === b.nodeType
      );
      return idxA - idxB;
    })
    .toArray();
  return (
    <div className="editor">
      <Typeahead
        ref={ref}
        autoFocus
        clearButton
        id="suggest"
        options={options}
        labelKey="text"
        onMenuToggle={() => {
          const menu = document.getElementById("suggest");
          if (menu) {
            menu.scrollIntoView({ behavior: "smooth", block: "end" });
          }
        }}
        renderMenu={(results, menuProps) => (
          <>
            <Menu {...menuProps} maxHeight="450px">
              <button
                type="button"
                className="workspace-droppable"
                aria-label="new"
                onClick={() => {
                  if (ref.current) {
                    switchToNew(ref.current.getInput().value);
                  }
                }}
              >
                <span className="simple-icon-plus mr-2" />
                <span>New Note, Topic or Source</span>
              </button>
              {results.map((result, index) => (
                <MenuItem
                  key={`search-${result.id}`}
                  option={result}
                  position={index}
                >
                  <div className="search-result">{result.text}</div>
                </MenuItem>
              ))}
            </Menu>
            <div ref={menuEnd} />
          </>
        )}
      />
      <div className="mt-4">
        <Button variant="success">Add</Button>
      </div>
    </div>
  );
}

type AddNodeProps = {
  column: WorkspaceColumn;
};

/* eslint-enable react/jsx-props-no-spreading */
export function AddNode({ column }: AddNodeProps): JSX.Element {
  const [isActive, setActive] = useState<boolean>(false);
  const [isCreatingNode, setIsCreatingNode] = useState<string | undefined>(
    undefined
  );
  const workspace = useWorkspace();
  const updateWorkspace = useUpdateWorkspace();

  const onCreateNewNode = (text: string, nodeType: NodeType): void => {
    const node = newNode(text, nodeType);
    const nodes = Immutable.Map<string, KnowNode>().set(node.id, node);
    updateWorkspace(
      {
        columns: workspace.columns.set(column.columnID, {
          ...column,
          nodeViews: column.nodeViews.push({
            nodeID: node.id
          })
        })
      },
      nodes
    );
  };
  return (
    <div>
      {!isActive && <AddNodeButton setIsWriting={() => setActive(true)} />}
      {isActive && isCreatingNode === undefined && (
        <Search
          switchToNew={(initialValue: string) => {
            setIsCreatingNode(initialValue);
          }}
        />
      )}
      {isActive && isCreatingNode !== undefined && (
        <Editor initialValue={isCreatingNode} onCreateNode={onCreateNewNode} />
      )}
    </div>
  );
}
