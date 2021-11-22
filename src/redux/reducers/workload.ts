import { createAction, createReducer } from "@reduxjs/toolkit";
import { Workload } from "../../models";

let WL_COUNTER = 1;
/**
 * Workloads are stores as array of workloads
 * The idea is to perform Object.is comparsions to identify a workload
 *
 */

const defaultState: Workload[] = [];

const addWorkload = createAction<Workload>("ADD_WORKLOAD");
const removeWorkload = createAction<Workload>("REMOVE_WORKLOAD");
const editWorkload = createAction<Workload>("EDIT_WORKLOAD");

const workloadReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addWorkload, (state, { payload }) => {
      payload.id = WL_COUNTER++;
      state.push(payload);
    })
    .addCase(removeWorkload, (state, { payload }) => {
      return state.filter((item) => payload.id !== item.id);
    })
    .addCase(editWorkload, (state, { payload }) => {
      return state.map((item) => {
        if (item.id === payload.id) {
          return Object.assign({}, item, payload);
        }
        return item;
      });
    });
});

export { addWorkload, removeWorkload, editWorkload, workloadReducer };
