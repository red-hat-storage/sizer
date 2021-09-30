import { createAction, createReducer } from "@reduxjs/toolkit";
import { makeId } from "../../components/Workload/util";
import { Workload } from "../../models";

/**
 * Workloads are stores as array of workloads
 * The idea is to perform Object.is comparsions to identify a workload
 *
 */

const defaultState: Workload[] = [];

const addWorkload = createAction<Workload>("ADD_WORKLOAD");
const removeWorkload = createAction<string>("REMOVE_WORKLOAD");
const editWorkload = createAction<Workload>("EDIT_WORKLOAD");

const workloadReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addWorkload, (state, { payload }) => {
      if (!payload.uid) {
        payload.uid = makeId(5);
      }
      state.push(payload);
    })
    .addCase(removeWorkload, (state, { payload }) => {
      return state.filter((item) => payload !== item.uid);
    })
    .addCase(editWorkload, (state, { payload }) => {
      return state.map((item) => {
        if (item.uid === payload.uid) {
          return Object.assign({}, item, payload);
        }
        return item;
      });
    });
});

export { addWorkload, removeWorkload, editWorkload, workloadReducer };
