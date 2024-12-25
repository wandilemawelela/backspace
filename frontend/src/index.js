/**
 * @fileoverview Entry point for the React application.
 * This file is responsible for rendering the root component (App) into the DOM.
 *
 * @requires react
 * @requires react-dom
 * @requires ./App.jsx
 */
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
