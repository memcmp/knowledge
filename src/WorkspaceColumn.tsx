import React from "react";
import { OuterNode } from "./OuterNode";

type WorkspaceColumnProps = {
  column: WorkspaceColumn;
};

export function WorkspaceColumnView({
  column
}: WorkspaceColumnProps): JSX.Element {
  return (
    <div className="workspace-column">
      {column.nodeViews.map(nodeView => {
        return <OuterNode nodeID={nodeView.nodeID} />;
      })}
    </div>
  );
}
