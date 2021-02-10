import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/sass/themes/gogo.light.blue.scss";
import { BrowserRouter } from "react-router-dom";
import { AppConfig, UserSession } from "@stacks/connect";
import App from "./App";

const appConfig = new AppConfig(["store_write", "publish_data"]);

const userSession = new UserSession({ appConfig });

ReactDOM.render(
  <BrowserRouter>
    <App userSession={userSession} />
  </BrowserRouter>,
  document.getElementById("root")
);
