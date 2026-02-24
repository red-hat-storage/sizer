import { Node, Zone } from "../types";

/**
 * Library version: Pure function that returns pruned state
 * Removes nodes with no services and zones with no nodes
 */
export const pruneNodes = (
  nodes: Node[],
  zones: Zone[]
): { nodes: Node[]; zones: Zone[] } => {
  const nodesToPrune = nodes.filter((node) => node.services.length === 0);
  
  if (nodesToPrune.length === 0) {
    return { nodes, zones };
  }

  const prunedNodesIDs = nodesToPrune.map((node) => node.id);
  const activeNodes = nodes.filter((node) => !prunedNodesIDs.includes(node.id));
  const activeNodeIDs = activeNodes.map((node) => node.id);
  
  const activeZones = zones.filter(
    (zone) => !zone.nodes.every((nodeId) => !activeNodeIDs.includes(nodeId))
  );

  return { nodes: activeNodes, zones: activeZones };
};
