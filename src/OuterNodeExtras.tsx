import React from "react";

import { Dropdown } from "react-bootstrap";

type OuterNodeExtrasProps = {
  displayConnections: DisplayConnections;
  onConnectionsChange: (displayConnections: DisplayConnections) => void;
  onRemove: () => void;
};

export function OuterNodeExtras({
  displayConnections,
  onConnectionsChange,
  onRemove
}: OuterNodeExtrasProps): JSX.Element {
  return (
    <div className="position-relative">
      <Dropdown>
        <Dropdown.Toggle
          as="button"
          className="btn outer-node-extras-btn hover-black"
        >
          <span className="simple-icon-options-vertical" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            active={displayConnections === "NONE"}
            onSelect={() => onConnectionsChange("NONE")}
          >
            Hide Connections
          </Dropdown.Item>
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
          <Dropdown.Divider />
          <Dropdown.Item onSelect={onRemove}>
            Remove from Dashboard
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
