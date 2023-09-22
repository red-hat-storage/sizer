import { createAction, createReducer } from "@reduxjs/toolkit";
import {
  defaultInstances,
  controlPlaneInstances,
  defaultODFInstances,
} from "../../cloudInstance";
import { MachineSet } from "../../types";
import { Platform } from "../../types";
import { disableCompactMode, enableCompactMode } from "./cluster";
import { getMachinetSetFromInstance } from "../../utils";

let MS_COUNTER = 2;

const defaultAWSInstace = defaultInstances[Platform.AWS];
const controlInstance = controlPlaneInstances[Platform.AWS];

const defaultState: MachineSet[] = [
  getMachinetSetFromInstance(
    defaultAWSInstace,
    0,
    "default",
    "Worker Node",
    undefined,
    24
  ),
  getMachinetSetFromInstance(
    controlInstance,
    1,
    "controlPlane",
    "Control Plane Node",
    undefined,
    24
  ),
];

const addMachineSet = createAction<MachineSet>("ADD_MACHINE");
const updateMachineSet = createAction<MachineSet>("UPDATE_MACHINE");
const removeMachineSet = createAction<number>("REMOVE_MACHINE");
const clearAllMachines = createAction("CLEAR_ALL_MACHINES");

const getDefaultCompactModeMachineSet = (platform: Platform) => {
  const instance = defaultODFInstances[platform];
  return getMachinetSetFromInstance(
    instance,
    MS_COUNTER++,
    "compact-default",
    "Compact Node"
  );
};

const machineSetReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addMachineSet, (machines, { payload: machine }) => {
      machines.push(Object.assign({}, machine, { id: MS_COUNTER++ }));
    })
    .addCase(removeMachineSet, (machines, { payload: id }) => {
      return machines.filter((item) => item.id !== id);
    })
    .addCase(updateMachineSet, (machines, { payload: machine }) => {
      const ms = machines.find((ms) => ms.id === machine.id);
      Object.assign(ms, machine);
    })
    .addCase(clearAllMachines, () => [])
    .addCase(enableCompactMode, (machines, { payload: platform }) => {
      return [getDefaultCompactModeMachineSet(platform)];
    })
    .addCase(disableCompactMode, (machines, { payload: platform }) => {
      return [
        getMachinetSetFromInstance(
          controlPlaneInstances[platform],
          MS_COUNTER++,
          "controlPlane",
          "Control Plane Node",
          undefined,
          24
        ),
        getMachinetSetFromInstance(
          defaultODFInstances[platform],
          MS_COUNTER++,
          "default",
          "Worker Node"
        ),
      ];
    });
});

export {
  addMachineSet,
  removeMachineSet,
  clearAllMachines,
  updateMachineSet,
  machineSetReducer,
};
