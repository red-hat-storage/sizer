import { createAction, createReducer } from "@reduxjs/toolkit";
import { Workload } from "../../types";
import { disableCompactMode, enableCompactMode } from "./cluster";

let WL_COUNTER = 1;
export const generateWorkloadID = (): number => WL_COUNTER++;

/**
 * Workloads are stores as array of workloads
 * The idea is to perform Object.is comparsions to identify a workload
 *
 */

const defaultState: Workload[] = [
  {
    name: "ControlPlane",
    count: 1,
    usesMachines: ["controlPlane"],
    services: [0],
    storageCapacityRequired: 1,
  },
];

const addWorkload = createAction<Workload>("ADD_WORKLOAD");
const removeWorkload = createAction<Workload>("REMOVE_WORKLOAD");
const removeWorkloads = createAction<Workload[]>("REMOVE_WORKLOADS");
const editWorkload = createAction<Workload>("EDIT_WORKLOAD");

const workloadReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addWorkload, (state, { payload }) => {
      state.push(payload);
    })
    .addCase(removeWorkload, (state, { payload }) => {
      return state.filter((item) => payload.id !== item.id);
    })
    .addCase(removeWorkloads, (state, { payload }) => {
      const ids = payload.map((workload) => workload.id);
      return state.filter((item) => !ids.includes(item.id));
    })
    .addCase(editWorkload, (state, { payload }) => {
      return state.map((item) => {
        if (item.id === payload.id) {
          return Object.assign({}, item, payload);
        }
        return item;
      });
    })
    .addCase(enableCompactMode, (state) => {
      return state.map((item) => {
        if (item.name === "ControlPlane") {
          return Object.assign({}, item, { usesMachines: [] });
        }
        return item;
      });
    })
    .addCase(disableCompactMode, (state) => {
      return state.map((item) => {
        if (item.name === "ControlPlane") {
          return Object.assign({}, item, { usesMachines: ["controlPlane"] });
        }
        return item;
      });
    });
});

export {
  addWorkload,
  removeWorkload,
  editWorkload,
  removeWorkloads,
  workloadReducer,
};
