import React from "react";
import { CreateNote } from "./CreateNote";
import { useSelectors } from "./DataContext";
import { Note } from "./Note";

type TimelineProps = {
  viewID: string;
};

function Timeline({ viewID }: TimelineProps): JSX.Element {
  const { getChildren } = useSelectors();
  const nodesInTimeline = getChildren(viewID);

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
