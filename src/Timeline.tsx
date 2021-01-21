import React from "react";
import { CreateNote } from "./CreateNote";
import { useSelectors } from "./DataContext";
import { Note } from "./Note";

type TimelineProps = {
  view: KnowNode;
};

function Timeline({ view }: TimelineProps): JSX.Element {
  const { getChildren } = useSelectors();
  const nodesInTimeline = getChildren(view);

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
