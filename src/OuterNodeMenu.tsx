import React from "react";
import { Set } from "immutable";

import { Dropdown } from "react-bootstrap";

import {
  useNodes,
  useDeleteNodes,
  getNode,
  useUpsertNodes
} from "./DataContext";

import {
  DeleteNodesContext,
  planNodeDeletion,
  removeRelationToObject,
  removeRelationToSubject
} from "./connections";

type OuterNodeMenuProps = {
  displayConnections: DisplayConnections;
  onConnectionsChange: (displayConnections: DisplayConnections) => void;
  onToggleMultiSelect: () => void;
  selectedItems: Set<string>;
  nodeID: string;
};

function disconnectNodes(
  nodes: Nodes,
  parentNode: string,
  children: Set<string>,
  displayConnections: DisplayConnections
): Nodes {
  if (displayConnections === "RELEVANT_SUBJECTS") {
    return children.reduce((rdx: Nodes, subject: string) => {
      const p = getNode(rdx, parentNode);
      const c = getNode(rdx, subject);
      return rdx
        .set(parentNode, removeRelationToSubject(p, subject, "RELEVANT"))
        .set(subject, removeRelationToObject(c, parentNode, "RELEVANT"));
    }, nodes);
  }
  if (displayConnections === "RELEVANT_OBJECTS") {
    return children.reduce((rdx: Nodes, obj: string) => {
      const p = getNode(rdx, parentNode);
      const c = getNode(rdx, obj);
      return rdx
        .set(parentNode, removeRelationToObject(p, obj, "RELEVANT"))
        .set(obj, removeRelationToSubject(c, parentNode, "RELEVANT"));
    }, nodes);
  }
  if (displayConnections === "CONTAINS_OBJECTS") {
    return children.reduce((rdx: Nodes, obj: string) => {
      const p = getNode(rdx, parentNode);
      const c = getNode(rdx, obj);
      return rdx
        .set(parentNode, removeRelationToObject(p, obj, "CONTAINS"))
        .set(obj, removeRelationToSubject(c, parentNode, "CONTAINS"));
    }, nodes);
  }
  return nodes;
}

export function OuterNodeMenu({
  nodeID,
  displayConnections,
  onConnectionsChange,
  onToggleMultiSelect,
  selectedItems
}: OuterNodeMenuProps): JSX.Element {
  const nodes = useNodes();
  const deleteNodes = useDeleteNodes();
  const upsertNodes = useUpsertNodes();

  const deleteSelectedNodes = (): void => {
    const deletePlan = selectedItems.reduce(
      (plan: DeleteNodesContext, id: string) => {
        return planNodeDeletion(plan.toUpdate, getNode(nodes, id));
      },
      { toUpdate: nodes, toRemove: Set<string>() }
    );
    deleteNodes(deletePlan.toRemove, deletePlan.toUpdate);
    onToggleMultiSelect();
  };

  const onDisconnect = (): void => {
    const updatedNodes = disconnectNodes(
      nodes,
      nodeID,
      selectedItems,
      displayConnections
    );
    upsertNodes(updatedNodes);
    onToggleMultiSelect();
  };

  return (
    <div className="outer-node-menu">
      <div className="outer-node-menu-outer-node">
        <button
          type="button"
          className="btn outer-node-menu-btn hover-black"
          onClick={onToggleMultiSelect}
        >
          <span className="iconsminds-check" />
        </button>
        <Dropdown>
          <Dropdown.Toggle
            as="button"
            className="btn outer-node-menu-btn hover-black outer-node-menu-dropdown"
          >
            <span className="iconsminds-arrow-inside-gap" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              active={displayConnections === "RELEVANT_SUBJECTS"}
              onSelect={() => onConnectionsChange("RELEVANT_SUBJECTS")}
            >
              Relevant Subjects
            </Dropdown.Item>
            <Dropdown.Item
              active={displayConnections === "RELEVANT_OBJECTS"}
              onSelect={() => onConnectionsChange("RELEVANT_OBJECTS")}
            >
              Relevant Objects
            </Dropdown.Item>
            <Dropdown.Item
              active={displayConnections === "CONTAINS_OBJECTS"}
              onSelect={() => onConnectionsChange("CONTAINS_OBJECTS")}
            >
              Contains
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="outer-node-menu-inner-nodes">
        {selectedItems.size > 0 && (
          <>
            <button
              type="button"
              className="btn outer-node-menu-btn hover-black"
              onClick={() => {
                onDisconnect();
              }}
            >
              <span className="font-size-2">×</span>
            </button>
            <button
              type="button"
              className="btn outer-node-menu-btn danger"
              onClick={() => {
                deleteSelectedNodes();
              }}
            >
              <span className="simple-icon-trash" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
