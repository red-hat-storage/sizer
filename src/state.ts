import { Action, DeploymentType, Payload, Platform, State } from "./types";

export const stateReducer = (
  state: State,
  action: { type: Action; payload: Payload }
): State => {
  const { type, payload } = action;
  switch (type) {
    case Action.setPlatform:
      return Object.assign({}, state, { platform: payload });
      break;
    case Action.setNodeCPU:
      return Object.assign({}, state, { nodeCPU: payload });
      break;
    case Action.setNodeMemory:
      return Object.assign({}, state, { nodeMemory: payload });
      break;
    case Action.setFlashSize:
      return Object.assign({}, state, { flashSize: payload });
      break;
    case Action.setUsableCapacity:
      return Object.assign({}, state, { usableCapacity: payload });
      break;
    case Action.setDeploymentType:
      return Object.assign({}, state, { deploymentType: payload });
      break;
    case Action.setNVMeTuning:
      return Object.assign({}, state, { nvmeTuning: payload });
      break;
    case Action.setCephFSActive:
      return Object.assign({}, state, { cephFSActive: payload });
      break;
    case Action.setNooBaaActive:
      return Object.assign({}, state, { nooBaaActive: payload });
      break;
    case Action.setRGWActive:
      return Object.assign({}, state, { rgwActive: payload });
      break;
    default:
      return state;
      break;
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
