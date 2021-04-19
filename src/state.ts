import { Action, DeploymentType, Payload, Platform, State } from "./types";

export const stateReducer = (
  state: State,
  action: { type: Action; payload: Payload }
): State => {
  const { type, payload } = action;
  switch (type) {
    case Action.setPlatform:
      return Object.assign({}, state, { platform: payload });
    case Action.setNodeCPU:
      return Object.assign({}, state, { nodeCPU: payload });
    case Action.setNodeMemory:
      return Object.assign({}, state, { nodeMemory: payload });
    case Action.setFlashSize:
      return Object.assign({}, state, { flashSize: payload });
    case Action.setUsableCapacity:
      return Object.assign({}, state, { usableCapacity: payload });
    case Action.setDeploymentType:
      return Object.assign({}, state, { deploymentType: payload });
    case Action.setNVMeTuning:
      return Object.assign({}, state, { nvmeTuning: payload });
    case Action.setCephFSActive:
      return Object.assign({}, state, { cephFSActive: payload });
    case Action.setNooBaaActive:
      return Object.assign({}, state, { nooBaaActive: payload });
    case Action.setRGWActive:
      return Object.assign({}, state, { rgwActive: payload });
    default:
      return state;
  }
};

export const initialState: State = {
  platform: Platform.BAREMETAL,
  nodeCPU: 32,
  nodeMemory: 64,
  flashSize: 2.5,
  usableCapacity: 10,
  deploymentType: DeploymentType.INTERNAL,
  nvmeTuning: false,
  cephFSActive: true,
  nooBaaActive: true,
  rgwActive: false,
};
