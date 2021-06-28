import { createAction, createReducer } from "@reduxjs/toolkit";
import { Platform } from "../../types";

const defaultState = {
  platform: Platform.AWS,
};

const setPlatform = createAction<Platform>("SET_PLATFORM");

const clusterReducer = createReducer(defaultState, (builder) => {
  builder.addCase(setPlatform, (state, { payload: platform }) => {
    state.platform = platform;
  });
});

export { setPlatform, clusterReducer };
