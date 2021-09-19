import { createAction, createReducer } from "@reduxjs/toolkit";
import { defaultInstances } from "../../cloudInstance";
import { MachineSet } from "../../models";
import { Platform } from "../../types";

const defaultAWSInstace = defaultInstances[Platform.AWS];

const defaultState: MachineSet[] = [
  {
    name: "default",
    cpu: defaultAWSInstace.cpuUnits,
    memory: defaultAWSInstace.memory,
    instanceName: defaultAWSInstace.name,
    numberOfDisks: 24,
    onlyFor: [],
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
