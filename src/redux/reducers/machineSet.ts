import { createAction, createReducer } from "@reduxjs/toolkit";
import { defaultInstances, controlPlaneInstances } from "../../cloudInstance";
import { MachineSet } from "../../models";
import { Platform } from "../../types";

const defaultAWSInstace = defaultInstances[Platform.AWS];
const controlInstance = controlPlaneInstances[Platform.AWS];

const defaultState: MachineSet[] = [
  {
    name: "default",
    cpu: defaultAWSInstace.cpuUnits,
    memory: defaultAWSInstace.memory,
    instanceName: defaultAWSInstace.name,
    numberOfDisks: 24,
    onlyFor: [],
    label: "Worker Node",
  },
  {
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
const removeMachineSet = createAction<string>("REMOVE_MACHINE");
const clearAllMachines = createAction("CLEAR_ALL_MACHINES");

const machineSetReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addMachineSet, (machines, { payload: machine }) => {
      machines.push(machine);
    })
    .addCase(removeMachineSet, (machines, { payload: machineName }) => {
      return machines.filter((item) => item.name !== machineName);
    })
    .addCase(clearAllMachines, () => []);
});

export { addMachineSet, removeMachineSet, clearAllMachines, machineSetReducer };
