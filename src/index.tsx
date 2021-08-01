import * as React from "react";
import * as ReactDOM from "react-dom";
import { Sizer } from "./components/sizer";
import "@patternfly/patternfly/patternfly.css";

const node = document.getElementById("root");

ReactDOM.render(<Sizer />, node);
