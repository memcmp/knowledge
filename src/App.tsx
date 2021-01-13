import React from "react";
import "./App.css";
import { CreateNote } from "./CreateNote";

function App() {
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
                <CreateNote />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
