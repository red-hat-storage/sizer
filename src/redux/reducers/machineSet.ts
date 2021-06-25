import { createAction, createReducer } from "@reduxjs/toolkit";
import { MachineSet } from "../../models";

const defaultState: MachineSet[] = [];

const addMachineSet = createAction<MachineSet>("ADD_MACHINE");
const removeMachineSet = createAction<string>("REMOVE_MACHINE");

const machineSetReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addMachineSet, (machines, { payload: machine }) => {
      machines.push(machine);
    })
    .addCase(removeMachineSet, (machines, { payload: machineName }) => {
      return machines.filter((item) => item.name !== machineName);
    });
});

export { addMachineSet, removeMachineSet, machineSetReducer };
