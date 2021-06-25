import { createAction, createReducer } from "@reduxjs/toolkit";
import { DeploymentType } from "../../types";

const defaultState = {
  flashSize: 2.5,
  usableCapacity: 10,
  deploymentType: DeploymentType.INTERNAL,
  // Currently not in use (Create actions when in use)
  nvmeTuning: false,
  cephFSActive: true,
  nooBaaActive: true,
  rgwActive: false,
  dedicatedMachines: [] as string[],
};

const setFlashSize = createAction<number>("SET_FLASH_SIZE");
const setUsableCapacity = createAction<number>("SET_USABLE_CAPACITY");
const setDeploymentType = createAction<DeploymentType>("SET_DEPLOYMENT_TYPE");
const setDedicatedMachines = createAction<string[]>("SET_DEDICATED_MACHINES");

const ocsReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(setFlashSize, (state, { payload }) => {
      state.flashSize = payload;
    })
    .addCase(setUsableCapacity, (state, { payload }) => {
      state.usableCapacity = payload;
    })
    .addCase(setDeploymentType, (state, { payload }) => {
      state.deploymentType = payload;
    })
    .addCase(setDedicatedMachines, (state, { payload }) => {
      state.dedicatedMachines = payload;
    });
});

export { setFlashSize, setUsableCapacity, setDeploymentType, ocsReducer };
