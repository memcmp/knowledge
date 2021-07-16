import React from "react";
import { Set } from "immutable";

import { Dropdown } from "react-bootstrap";

import { useNodes, useSelectors, useDeleteNodes } from "./DataContext";

import { DeleteNodesContext, planNodeDeletion } from "./connections";

type OuterNodeMenuProps = {
  displayConnections: DisplayConnections;
  onConnectionsChange: (displayConnections: DisplayConnections) => void;
  onToggleMultiSelect: () => void;
  selectedItems: Set<string>;
};

export function OuterNodeMenu({
  displayConnections,
  onConnectionsChange,
  onToggleMultiSelect,
  selectedItems
}: OuterNodeMenuProps): JSX.Element {
  const nodes = useNodes();
  const { getNode } = useSelectors();
  const deleteNodes = useDeleteNodes();

  const deleteSelectedNodes = (): void => {
    const deletePlan = selectedItems.reduce(
      (plan: DeleteNodesContext, id: string) => {
        return planNodeDeletion(plan.toUpdate, getNode(id));
      },
      { toUpdate: nodes, toRemove: Set<string>() }
    );
    deleteNodes(deletePlan.toRemove, deletePlan.toUpdate);
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
          <button
            type="button"
            className="btn outer-node-menu-btn danger"
            onClick={() => {
              deleteSelectedNodes();
            }}
          >
            <span className="simple-icon-trash" />
          </button>
        )}
      </div>
    </div>
  );
}
