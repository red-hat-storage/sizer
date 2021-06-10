import { configureStore } from "@reduxjs/toolkit";
import { uiReducer, ocsReducer } from "./reducers";

const store = configureStore({
  reducer: { ui: uiReducer, ocs: ocsReducer },
});

export { store };
