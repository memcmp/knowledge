import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import { RelationContext } from "./DataContext";
import { NoteDetail } from "./NoteDetail";
import { Timeline } from "./Timeline";
import Immutable from "immutable";

import { userSession, authenticate } from "./auth";
import { getDataStore, saveDataStore } from "./storage";

import { Button } from "react-bootstrap";

export const TIMELINE = "TIMELINE";

function App() {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
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
    const newStorage = { nodes: dataStore.nodes.merge(nodes) };
    setDataStore(newStorage);
    if (userSession.isUserSignedIn()) {
      saveDataStore(newStorage);
    }
  };

  if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(loadedUserData => {
      window.history.replaceState({}, document.title, "/");
    });
  } else if (userSession.isUserSignedIn() && !dataLoaded) {
    setDataLoaded(true);
    (async () => {
      const loadedStore = await getDataStore();
      setDataStore(loadedStore);
    })();
  }

  return (
    <div className="h-100">
      <div
        id="app-container"
        className="menu-default menu-sub-hidden main-hidden sub-hidden"
      >
        <main>
          <div className="container-fluid">
            <div className="dashboard-wrapper">
              {!userSession.isUserSignedIn() && (
                <Button onClick={() => authenticate()}>Login</Button>
              )}
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
