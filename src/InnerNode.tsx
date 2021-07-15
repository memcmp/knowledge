import React from "react";
import { Badge, Card } from "react-bootstrap";
import { Draggable } from "react-beautiful-dnd";

import {
  useFindSelectedByPostfix,
  useIsSelected,
  useSetSelected
} from "./MultiSelectContext";

type InnderNodeProps = {
  nodeID: string;
  index: number;
  dndPostfix: string;
  children: React.ReactNode;
  enableSelecting: boolean;
};

type SelectboxProps = {
  checked: boolean;
  setSelected: (checked: boolean) => void;
};

/* eslint-disable jsx-a11y/label-has-associated-control */
function Selectbox({ checked, setSelected }: SelectboxProps): JSX.Element {
  return (
    <div className="checkbox">
      <div className="pretty p-default p-round font-size-select">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => {
            setSelected(e.target.checked);
          }}
        />
        <div className="state p-info p-info-o">
          <label />
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/unbound-method */
export function InnerNode({
  children,
  nodeID,
  index,
  dndPostfix,
  enableSelecting
}: InnderNodeProps): JSX.Element {
  const setSelected = useSetSelected();
  const findSelected = useFindSelectedByPostfix();
  const isSelected = useIsSelected();
  const id = `${nodeID}.${dndPostfix}`;
  const checked = isSelected(id);
  const NodeCard = ({
    badge,
    checkbox
  }: {
    badge: number | undefined;
    checkbox: boolean;
  }): JSX.Element => (
    <Card className="inner-node">
      {badge !== undefined && (
        <div
          className="position-absolute"
          style={{ right: "-2px", top: "0px" }}
        >
          <Badge pill variant="primary" className="mb-1">
            {badge}
          </Badge>
        </div>
      )}
      {checkbox && (
        <div className="d-flex align-center pl-2">
          <Selectbox checked={checked} setSelected={c => setSelected(id, c)} />
          <div className="next-to-checkbox">
            <Card.Body className="p-3">{children}</Card.Body>
          </div>
        </div>
      )}
      {!checkbox && <Card.Body className="p-3">{children}</Card.Body>}
    </Card>
  );
  const badgeCounter = checked ? findSelected(dndPostfix).size : undefined;
  return (
    <Draggable key={nodeID} draggableId={`drag.inner.${id}`} index={index}>
      {(providedDraggable, snapshot) => (
        <>
          <div
            ref={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            {...providedDraggable.dragHandleProps}
            style={providedDraggable.draggableProps.style}
          >
            <NodeCard
              badge={snapshot.isDragging ? badgeCounter : undefined}
              checkbox={enableSelecting && !snapshot.isDragging}
            />
          </div>
          {snapshot.isDragging &&
            snapshot.draggingOver !== `drop.outer.${dndPostfix}` && (
              <NodeCard badge={undefined} checkbox={enableSelecting} />
            )}
        </>
      )}
    </Draggable>
  );
}
/* eslint-enable react/jsx-props-no-spreading */
/* eslint-enable @typescript-eslint/unbound-method */
