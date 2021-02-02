import React from "react";
import { CreateNote } from "./CreateNote";
import { useSelectors } from "./DataContext";
import { Note } from "./Note";
import { INTERESTS } from "./storage";

type TimelineProps = {
  view: KnowNode;
};

function Timeline({ view }: TimelineProps): JSX.Element {
  const { getObjects, getSubjects, getNode } = useSelectors();
  const nodesInTimeline = [
    ...getSubjects(getNode(INTERESTS)),
    ...getObjects(view)
  ];

  return (
    <>
      <div className="row">
        <CreateNote />
      </div>
      {nodesInTimeline.map(node => (
        <div className="row" key={node.id}>
          <Note node={node} />
        </div>
      ))}
    </>
  );
}
export { Timeline };
