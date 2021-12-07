import { createAction, createReducer } from "@reduxjs/toolkit";
import { Zone } from "../../types";
import { Platform } from "../../types";

const defaultState = {
  platform: Platform.AWS,
  zones: [] as Zone[],
};

const setPlatform = createAction<Platform>("SET_PLATFORM");

const clusterReducer = createReducer(defaultState, (builder) => {
  builder.addCase(setPlatform, (state, { payload: platform }) => {
    state.platform = platform;
    state.zones = [];
    return state;
  });
});

export { setPlatform, clusterReducer };
