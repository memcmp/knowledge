import React, { useEffect, useState } from "react";
import Immutable from "immutable";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";
import { Typeahead, Menu, MenuItem } from "react-bootstrap-typeahead";

import {
  useNodes,
  useUpdateWorkspace,
  useWorkspace,
  useUpsertNodes,
  useSelectors
} from "./DataContext";

import {
  connectRelevantNodes,
  defaultDisplayConnection,
  newNode,
  connectContainingNodes
} from "./connections";

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

function CloseButton({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <button
      className="btn btn-empty text-large p-1 hover-black"
      type="button"
      onClick={onClose}
    >
      <span aria-hidden="true">×</span>
      <span className="sr-only">Close</span>
    </button>
  );
}

type EditorProps = {
  initialValue: string;
  onCreateNode: (text: string, nodeType: NodeType) => void;
  onClose: () => void;
};

function Editor({
  initialValue,
  onCreateNode,
  onClose
}: EditorProps): JSX.Element {
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
        <CloseButton onClose={onClose} />
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
  onSave: (node: KnowNode) => void;
  onClose: () => void;
};

/* eslint-disable react/jsx-props-no-spreading */
function Search({ switchToNew, onSave, onClose }: SearchProps): JSX.Element {
  const [selectedValue, setSelectedValue] = useState<KnowNode | undefined>();
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

  const onChange = (newSelection: Array<KnowNode>): void => {
    if (newSelection.length === 0) {
      setSelectedValue(undefined);
      return;
    }
    setSelectedValue(newSelection[0]);
  };

  const onAdd = (): void => {
    if (selectedValue) {
      onSave(selectedValue);
      if (ref.current) {
        ref.current.clear();
      }
      setSelectedValue(undefined);
    }
  };

  return (
    <div className="editor">
      <Typeahead
        ref={ref}
        autoFocus
        clearButton
        onChange={onChange}
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
        <Button
          variant="success"
          onClick={onAdd}
          disabled={selectedValue === undefined}
        >
          Add
        </Button>
        <CloseButton
          onClose={() => {
            if (ref.current) {
              ref.current.clear();
            }
            setSelectedValue(undefined);
            onClose();
          }}
        />
      </div>
    </div>
  );
  /* eslint-enable react/jsx-props-no-spreading */
}

type AddNodeProps = {
  onCreateNewNode: (text: string, nodeType: NodeType) => void;
  onAddExistingNode: (node: KnowNode) => void;
};

function AddNode({
  onCreateNewNode,
  onAddExistingNode
}: AddNodeProps): JSX.Element {
  const [isActive, setActive] = useState<boolean>(false);
  const [isCreatingNode, setIsCreatingNode] = useState<string | undefined>(
    undefined
  );
  const reset = (): void => {
    setActive(false);
    setIsCreatingNode(undefined);
  };

  const createNewNode = (text: string, nodeType: NodeType): void => {
    onCreateNewNode(text, nodeType);
    reset();
  };

  const addExistingNode = (node: KnowNode): void => {
    onAddExistingNode(node);
    reset();
  };

  return (
    <div>
      {!isActive && <AddNodeButton setIsWriting={() => setActive(true)} />}
      {isActive && isCreatingNode === undefined && (
        <Search
          onSave={addExistingNode}
          switchToNew={(initialValue: string) => {
            setIsCreatingNode(initialValue);
          }}
          onClose={reset}
        />
      )}
      {isActive && isCreatingNode !== undefined && (
        <Editor
          initialValue={isCreatingNode}
          onCreateNode={createNewNode}
          onClose={reset}
        />
      )}
    </div>
  );
}

type AddNodeToColumnProps = {
  column: WorkspaceColumn;
};

export function AddNodeToColumn({ column }: AddNodeToColumnProps): JSX.Element {
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
            nodeID: node.id,
            displayConnections: defaultDisplayConnection(nodeType)
          })
        })
      },
      nodes
    );
  };

  const onAddExistingNode = (node: KnowNode): void => {
    updateWorkspace(
      {
        columns: workspace.columns.set(column.columnID, {
          ...column,
          nodeViews: column.nodeViews.push({
            nodeID: node.id,
            displayConnections: defaultDisplayConnection(node.nodeType)
          })
        })
      },
      Immutable.Map<string, KnowNode>()
    );
  };
  return (
    <AddNode
      onCreateNewNode={onCreateNewNode}
      onAddExistingNode={onAddExistingNode}
    />
  );
}

function connectNodes(
  parentNode: KnowNode,
  child: KnowNode,
  display: DisplayConnections
): Immutable.Map<string, KnowNode> {
  const nodes = Immutable.Map<string, KnowNode>()
    .set(parentNode.id, parentNode)
    .set(child.id, child);
  if (display === "NONE" || display === "RELEVANT_SUBJECTS") {
    return connectRelevantNodes(child.id, parentNode.id, nodes);
  }
  if (display === "RELEVANT_OBJECTS") {
    return connectRelevantNodes(parentNode.id, child.id, nodes);
  }
  if (display === "CONTAINS_OBJECTS") {
    return connectContainingNodes(parentNode.id, child.id, nodes);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled connection type ${display}`);
}

type AddNodeToNodeProps = {
  parentNodeView: NodeView;
};

export function AddNodeToNode({
  parentNodeView
}: AddNodeToNodeProps): JSX.Element {
  const { getNode } = useSelectors();
  const upsertNodes = useUpsertNodes();
  const parentId = parentNodeView.nodeID;
  const connectionType = parentNodeView.displayConnections;

  const onCreateNewNode = (text: string, nodeType: NodeType): void => {
    const parentNode = getNode(parentId);
    const node = newNode(text, nodeType);
    upsertNodes(connectNodes(parentNode, node, connectionType));
  };

  const onAddExistingNode = (node: KnowNode): void => {
    const parentNode = getNode(parentId);
    upsertNodes(connectNodes(parentNode, node, connectionType));
  };

  return (
    <AddNode
      onCreateNewNode={onCreateNewNode}
      onAddExistingNode={onAddExistingNode}
    />
  );
}
