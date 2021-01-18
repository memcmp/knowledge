import React from "react";
import { CreateNote } from "./CreateNote";
import { useRelations, useSelectors } from "./DataContext";
import { Note } from "./Note";

type TimelineProps = {
  viewID: string;
};

function Timeline({ viewID }: TimelineProps): JSX.Element {
  const { getNode } = useSelectors();
  const relations = useRelations();
  const nodesInTimeline = relations
    .filter(relation => getNode(relation.a).id === viewID)
    .map((rel: Relation) => getNode(rel.b));

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
