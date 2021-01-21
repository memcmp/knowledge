import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import { RelationContext } from "./DataContext";
import { NoteDetail } from "./NoteDetail";
import { Timeline } from "./Timeline";
import Immutable from "immutable";

export const TIMELINE = "TIMELINE";

function App() {
  const [dataStore, setDataStore] = useState<Store>({
    nodes: Immutable.Map({
      [TIMELINE]: {
        id: TIMELINE,
        nodeType: "VIEW",
        text: "Timeline",
        parentRelations: [],
        childRelations: []
      }
    })
  });

  const addBucket = (nodes: Immutable.Map<string, KnowNode>) => {
    setDataStore({
      nodes: dataStore.nodes.merge(nodes)
    });
  };
  return (
    <div className="h-100">
      <div
        id="app-container"
        className="menu-default menu-sub-hidden main-hidden sub-hidden"
      >
        <main>
          <div className="container-fluid">
            <div className="dashboard-wrapper">
              <RelationContext.Provider
                value={{
                  nodes: dataStore.nodes,
                  addBucket
                }}
              >
                <Switch>
                  <Route exact path="/">
                    <Timeline
                      view={dataStore.nodes.get(TIMELINE) as KnowNode}
                    />
                  </Route>
                  <Route path="/notes/:id">
                    <NoteDetail />
                  </Route>
                </Switch>
              </RelationContext.Provider>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
