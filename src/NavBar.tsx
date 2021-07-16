import React, { useState } from "react";
import {
  Form,
  InputGroup,
  Modal,
  Dropdown,
  FormControl,
  Button
} from "react-bootstrap";
import { CirclePicker } from "react-color";

import {
  useAddWorkspace,
  useSelectWorkspace,
  useWorkspaces
} from "./DataContext";

const COLORS = [
  "#8f2c3b",
  "#027d86",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#a1cb58",
  "#e7c550",
  "#ffc107",
  "#ff9800",
  "#bf4d3e",
  "#795548"
];

type NewWorkspaceProps = {
  onHide: () => void;
  onCreateNewWorkspace: (title: string, color: string) => void;
};

function NewWorkspace({
  onHide,
  onCreateNewWorkspace
}: NewWorkspaceProps): JSX.Element {
  const [color, setColor] = useState<string | undefined>(undefined);
  const defaultColor = COLORS[0];

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    onCreateNewWorkspace(title, color || defaultColor);
  };

  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton style={{ backgroundColor: color || COLORS[0] }}>
        <Modal.Title>New Worksapce</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <InputGroup.Prepend>
            <InputGroup.Text>Title</InputGroup.Text>
            <FormControl name="title" required />
          </InputGroup.Prepend>
          <CirclePicker
            width="100%"
            circleSpacing={12}
            color={color || defaultColor}
            colors={COLORS}
            onChange={c => setColor(c.hex)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

/* eslint-disable react/no-array-index-key */
export function NavBar(): JSX.Element {
  const [newWorkspace, setNewWorkspace] = useState<boolean>(false);
  const addWorkspace = useAddWorkspace();
  const selectWorkspace = useSelectWorkspace();
  const workspaces = useWorkspaces();
  return (
    <nav className="navbar navbar-bg">
      {newWorkspace && (
        <NewWorkspace
          onHide={() => setNewWorkspace(false)}
          onCreateNewWorkspace={(title: string, color: string) => {
            addWorkspace(title, color);
            setNewWorkspace(false);
          }}
        />
      )}
      <div className="navbar-left">
        <Dropdown>
          <Dropdown.Toggle as="button" className="btn navbar-button">
            <span className="simple-icon-layers" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {workspaces.map((workspace, index) => {
              return (
                <Dropdown.Item
                  className="d-flex workspace-selection"
                  onSelect={() => {
                    selectWorkspace(index);
                  }}
                  key={index}
                >
                  <div
                    className="workspace-selection-color"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <div className="workspace-selection-text">
                    {workspace.title}
                  </div>
                </Dropdown.Item>
              );
            })}
            <Dropdown.Divider />
            <Dropdown.Item
              className="d-flex workspace-selection"
              onSelect={() => setNewWorkspace(true)}
            >
              <div
                className="workspace-selection-color"
                style={{ backgroundColor: "gray" }}
              />
              <div className="workspace-selection-text">
                Create new Workspace
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </nav>
  );
}
