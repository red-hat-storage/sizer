import { createAction, createReducer } from "@reduxjs/toolkit";
import { Service } from "../../types";
import { Node } from "../../types";

let NODE_COUNTER = 1;

export const getNodeID = (): number => NODE_COUNTER++;

const defaultState = {
  nodes: [] as Node[],
};

const addNode = createAction<Node>("ADD_NODE");
const updateNode = createAction<Node>("UPDATE_NODE_NODE");
const addServicesToNode = createAction<{ nodeID: number; services: number[] }>(
  "ADD_SERVICE_TO_NODE"
);
const removeServicesFromNodes = createAction<Service[]>("REMOVE_SERVICES");
const removeNodes = createAction<Node[]>("REMOVE_NODES");

const nodeReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addNode, (state, { payload: node }) => {
      state.nodes.push(node);
    })
    .addCase(updateNode, ({ nodes }, { payload: updated }) => {
      nodes.map((node) =>
        node.id === updated.id ? Object.assign({}, node, updated) : node
      );
    })
    .addCase(addServicesToNode, (state, { payload }) => {
      const node = state.nodes.find(
        (node) => node.id === payload.nodeID
      ) as Node;
      node.services = [...node?.services, ...payload.services];
    })
    .addCase(removeServicesFromNodes, (state, { payload }) => {
      const serviceIDs = payload.map((service) => service.id);
      state.nodes.map((node) => {
        node.services = node.services.filter(
          (service) => !serviceIDs.includes(service)
        );
      });
    })
    .addCase(removeNodes, (state, { payload }) => {
      const nodeIDs = payload.map((node) => node.id);
      state.nodes = state.nodes.filter((node) => !nodeIDs.includes(node.id));
    });
});

export {
  addNode,
  updateNode,
  addServicesToNode,
  removeServicesFromNodes,
  removeNodes,
  nodeReducer,
};
