import React from "react";
import "./Workspace.css";

import { WorkspaceColumnView } from "./WorkspaceColumn";

type WorkspaceViewProps = {
  workspace: Workspace;
};

export function WorkspaceView({ workspace }: WorkspaceViewProps): JSX.Element {
  return (
    <div className="h-100 w-100">
      <div className="workspace-columns">
        {workspace.columns.map(column => {
          return <WorkspaceColumnView column={column} />;
        })}
        <div className="workspace-column" />
      </div>
    </div>
  );
}
