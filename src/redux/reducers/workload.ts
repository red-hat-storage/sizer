import { createAction, createReducer } from "@reduxjs/toolkit";
import { Workload } from "../../models";

/**
 * Workloads are stores as array of workloads
 * The idea is to perform Object.is comparsions to identify a workload
 *
 */

const defaultState: Workload[] = [];

const addWorkload = createAction<Workload>("ADD_WORKLOAD");
const removeWorkload = createAction<string>("REMOVE_WORKLOAD");

const workloadReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addWorkload, (state, { payload }) => {
      state.push(payload);
    })
    .addCase(removeWorkload, (state, { payload }) => {
      return state.filter((item) => payload !== item.name);
    });
});

export { addWorkload, removeWorkload, workloadReducer };
