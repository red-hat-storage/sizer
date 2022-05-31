import { createAction, createReducer } from "@reduxjs/toolkit";
import { defaultInstances, controlPlaneInstances } from "../../cloudInstance";
import { MachineSet } from "../../types";
import { Platform } from "../../types";

let MS_COUNTER = 2;

const defaultAWSInstace = defaultInstances[Platform.AWS];
const controlInstance = controlPlaneInstances[Platform.AWS];

const defaultState: MachineSet[] = [
  {
    id: 0,
    name: "default",
    cpu: defaultAWSInstace.cpuUnits,
    memory: defaultAWSInstace.memory,
    instanceName: defaultAWSInstace.name,
    numberOfDisks: 24,
    onlyFor: [],
    label: "Worker Node",
  },
  {
    id: 1,
    name: "controlPlane",
    cpu: controlInstance.cpuUnits,
    memory: controlInstance.memory,
    instanceName: controlInstance.name,
    numberOfDisks: 24,
    onlyFor: ["ControlPlane"],
    label: "Control Plane Node",
  },
];

const addMachineSet = createAction<MachineSet>("ADD_MACHINE");
const updateMachineSet = createAction<MachineSet>("UPDATE_MACHINE");
const removeMachineSet = createAction<number>("REMOVE_MACHINE");
const clearAllMachines = createAction("CLEAR_ALL_MACHINES");

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
    .addCase(clearAllMachines, () => []);
});

export {
  addMachineSet,
  removeMachineSet,
  clearAllMachines,
  updateMachineSet,
  machineSetReducer,
};
