import { Dispatch } from "@reduxjs/toolkit";
import { Node, Zone } from "../../src/types";
import { removeNodes } from "../redux/reducers/node";
import { removeZone } from "../redux/reducers/zone";

export const pruneNodes =
  (dispatch: Dispatch) =>
  (nodes: Node[], zones: Zone[]): void => {
    const nodesToPrune = nodes.filter((node) => node.services.length === 0);
    if (nodesToPrune.length > 0) {
      dispatch(removeNodes(nodesToPrune));
      const prunedNodesIDs = nodesToPrune.map((node) => node.id);
      const activeNodeIDs = nodes
        .filter((node) => !prunedNodesIDs.includes(node.id))
        .map((node) => node.id);
      const zonesToPrune = zones.filter((zone) =>
        zone.nodes.every((item) => activeNodeIDs.includes(item))
      );
      zonesToPrune.forEach((zone) => dispatch(removeZone(zone)));
    }
  };
