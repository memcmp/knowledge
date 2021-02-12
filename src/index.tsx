import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/sass/themes/gogo.light.blue.scss";
import { BrowserRouter } from "react-router-dom";
import { AppConfig, UserSession } from "@stacks/connect";
import { Storage } from "@stacks/storage";
import App from "./App";

const appConfig = new AppConfig(["store_write", "publish_data"]);

const session = new UserSession({ appConfig });

function createStackStore(userSession: UserSession): Storage {
  return new Storage({ userSession });
}

ReactDOM.render(
  <BrowserRouter>
    <App userSession={session} createStackStore={createStackStore} />
  </BrowserRouter>,
  document.getElementById("root")
);
