import { configureStore } from "@reduxjs/toolkit";
import {
  uiReducer,
  ocsReducer,
  workloadReducer,
  machineSetReducer,
  clusterReducer,
} from "./reducers";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    ocs: ocsReducer,
    workload: workloadReducer,
    machineSet: machineSetReducer,
    cluster: clusterReducer,
  },
});

type Store = ReturnType<typeof store.getState>;

export { store, Store };
