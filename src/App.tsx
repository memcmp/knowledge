import React, { useState } from "react";
import "./App.css";
import { CreateNote } from "./CreateNote";

import { Note } from "./Note";

const TIMELINE = "TIMELINE";

function App() {
  const [relations, setRelations] = useState<Relations>([]);

  const onCreateNode = (newRelations: Relations) => {
    setRelations([...newRelations, ...relations]);
  };

  const nodesInTimeline = relations
    .filter(
      (relation: Relation): boolean =>
        relation.a.nodeType === "VIEW" && relation.a.text === TIMELINE
    )
    .map((rel: Relation) => rel.b);

  return (
    <div className="h-100">
      <div
        id="app-container"
        className="menu-default menu-sub-hidden main-hidden sub-hidden"
      >
        <main>
          <div className="container-fluid">
            <div className="dashboard-wrapper">
              <div className="row">
                <CreateNote onCreateNode={onCreateNode} />
              </div>
              {nodesInTimeline.map((node, i) => (
                <div className="row" key={node.text + i}>
                  <Note node={node} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
