import * as React from "react";
import { createRoot } from "react-dom/client";
import { Sizer } from "./components/sizer";
import "@patternfly/patternfly/patternfly.css";

const node = document.getElementById("root");
const root = createRoot(node as HTMLElement);
root.render(<Sizer />);
