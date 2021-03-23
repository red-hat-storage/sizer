import * as React from "react";
import * as ReactDOM from "react-dom";
import { Sizer } from "./components/sizer";
import "@patternfly/patternfly/patternfly.css";

const node = document.getElementById("app");

ReactDOM.render(<Sizer />, node);
