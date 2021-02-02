import React, { useState } from "react";
import { Modal, InputGroup, Button } from "react-bootstrap";
import Immutable from "immutable";

import { useSelectors } from "./DataContext";

import { Searchbox, SearchboxProps } from "./Searchbox";

import { INTERESTS } from "./storage";

import { connectRelevantNodes, newNode } from "./connections";

function SearchBoxWithPrepend({
  suggestions,
  onCreateNode,
  onSelectNode,
  onClear,
  prepend
}: SearchboxProps & { prepend: string }): JSX.Element {
  return (
    <InputGroup className="input-group-sm mt-4">
      <InputGroup.Prepend>
        <InputGroup.Text className="text-primary">{prepend}</InputGroup.Text>
      </InputGroup.Prepend>
      <Searchbox
        suggestions={suggestions}
        onCreateNode={onCreateNode}
        onSelectNode={onSelectNode}
        onClear={onClear}
      />
    </InputGroup>
  );
}

type ReducerType = { allNodes: Nodes; currentSubject: undefined | KnowNode };

type NewTopicModalProps = {
  topic: string;
  onHide: () => void;
  onCreateNewTopic: (newTopic: KnowNode, additonalNodes: Nodes) => void;
};

function NewTopicModal({
  topic,
  onHide,
  onCreateNewTopic
}: NewTopicModalProps): JSX.Element {
  const { getAllNodesByType, getNode } = useSelectors();
  const [newTopics, setNewTopics] = useState<
    Immutable.List<string | undefined | KnowNode>
  >(Immutable.List([topic]));
  const [topNode, setTopNode] = useState<KnowNode | undefined>();

  const onCreateNode = (newTopic: string | undefined, index: number) => {
    setNewTopics(newTopics.set(index, newTopic));
  };

  const onSelectNode = (selectedNode: KnowNode, index: number) => {
    setTopNode(selectedNode);
    setNewTopics(newTopics.slice(0, index));
  };

  const submit = () => {
    const topicsAsNodes = newTopics
      .map(newTopic => {
        return newNode(newTopic as string, "TOPIC");
      })
      .push(topNode as KnowNode);
    const newTopicID = (topicsAsNodes.get(0) as KnowNode).id;
    const allNodes = Immutable.Map<string, KnowNode>(
      topicsAsNodes.map(n => [n.id, n])
    );
    const init: ReducerType = { allNodes, currentSubject: undefined };
    const connectedNewTopics = topicsAsNodes.reduce(
      (reducer: ReducerType, objectTopic: KnowNode): ReducerType => {
        if (reducer.currentSubject === undefined) {
          return {
            ...reducer,
            currentSubject: objectTopic
          };
        }
        return {
          allNodes: connectRelevantNodes(
            reducer.currentSubject.id,
            objectTopic.id,
            reducer.allNodes
          ),
          currentSubject: objectTopic
        };
      },
      init
    ).allNodes;
    onCreateNewTopic(
      connectedNewTopics.get(newTopicID) as KnowNode,
      connectedNewTopics
    );
  };

  const allTopics = [getNode(INTERESTS), ...getAllNodesByType("TOPIC")];
  const enableSubmit =
    topNode !== undefined &&
    newTopics.filter(newTopic => newTopic === undefined).size === 0;

  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>New Topic</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {newTopics.push(topNode).map((newTopic, i) => {
          return (
            <SearchBoxWithPrepend
              prepend={i > 0 ? "Relevant for" : "New Topic"}
              suggestions={[
                {
                  customOption: true,
                  plainText:
                    newTopic && i < newTopics.size ? (newTopic as string) : ""
                },
                ...allTopics
              ]}
              onCreateNode={newNode => onCreateNode(newNode, i)}
              onSelectNode={selected => onSelectNode(selected, i)}
              onClear={() => {
                onCreateNode(undefined, i);
              }}
            />
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          type="submit"
          disabled={!enableSubmit}
          onClick={submit}
        >
          Create Topic
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export { NewTopicModal };
