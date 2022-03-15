import React from "react";
import ReactDOM from "react-dom";
import { App } from './app';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import "@patternfly/quickstarts/dist/quickstarts.min.css";
import "@patternfly/transform-adoc/dist/transform-adoc.css";

ReactDOM.render(<App />, document.getElementById("root"));
