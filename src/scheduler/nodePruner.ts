import { Dispatch } from "@reduxjs/toolkit";
import { Node } from "../../src/types";
import { removeNodes } from "../redux";

export const pruneNodes = (dispatch: Dispatch) => (nodes: Node[]) => {
  const nodesToPrune = nodes.filter((node) => node.services.length === 0);
  if (nodesToPrune.length > 0) {
    dispatch(removeNodes(nodesToPrune));
  }
};
