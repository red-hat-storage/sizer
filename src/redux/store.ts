import { configureStore } from "@reduxjs/toolkit";
import { uiReducer } from "./reducers/ui";
import { ocsReducer } from "./reducers/ocs";
import { workloadReducer } from "./reducers/workload";
import { machineSetReducer } from "./reducers/machineSet";
import { clusterReducer } from "./reducers/cluster";
import { nodeReducer } from "./reducers/node";
import { zoneReducer } from "./reducers/zone";
import { serviceReducer } from "./reducers/service";

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
