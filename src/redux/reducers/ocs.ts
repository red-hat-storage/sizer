import { createAction, createReducer } from "@reduxjs/toolkit";
import { Platform, DeploymentType } from "../../types";

const defaultState = {
  platform: Platform.BAREMETAL,
  nodeCPU: 32,
  nodeMemory: 64,
  flashSize: 2.5,
  usableCapacity: 10,
  deploymentType: DeploymentType.INTERNAL,
  // Currently not in use (Create actions when in use)
  nvmeTuning: false,
  cephFSActive: true,
  nooBaaActive: true,
  rgwActive: false,
};

const setPlatform = createAction<Platform>("SET_PLATFORM");
const setNodeCPU = createAction<number>("SET_NODE_CPU");
const setNodeMemory = createAction<number>("SET_NODE_MEMORY");
const setFlashSize = createAction<number>("SET_FLASH_SIZE");
const setUsableCapacity = createAction<number>("SET_USABLE_CAPACITY");
const setDeploymentType = createAction<DeploymentType>("SET_DEPLOYMENT_TYPE");

const ocsReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(setPlatform, (state, { payload }) => {
      state.platform = payload;
      if (payload === Platform.AWSi3) {
        state.flashSize = 2.5;
      }
    })
    .addCase(setNodeCPU, (state, { payload }) => {
      state.nodeCPU = payload;
    })
    .addCase(setNodeMemory, (state, { payload }) => {
      state.nodeMemory = payload;
    })
    .addCase(setFlashSize, (state, { payload }) => {
      state.flashSize = payload;
    })
    .addCase(setUsableCapacity, (state, { payload }) => {
      state.usableCapacity = payload;
    })
    .addCase(setDeploymentType, (state, { payload }) => {
      state.deploymentType = payload;
    });
});

export {
  setPlatform,
  setNodeCPU,
  setNodeMemory,
  setFlashSize,
  setUsableCapacity,
  setDeploymentType,
  ocsReducer,
};
