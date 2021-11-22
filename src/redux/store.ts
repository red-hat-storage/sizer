import { configureStore } from "@reduxjs/toolkit";
import {
  uiReducer,
  ocsReducer,
  workloadReducer,
  machineSetReducer,
  clusterReducer,
  nodeReducer,
  zoneReducer,
  serviceReducer,
} from "./reducers";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    ocs: ocsReducer,
    workload: workloadReducer,
    machineSet: machineSetReducer,
    cluster: clusterReducer,
    node: nodeReducer,
    zone: zoneReducer,
    service: serviceReducer,
  },
});

type Store = ReturnType<typeof store.getState>;

export { store, Store };
