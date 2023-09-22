import { createAction, createReducer } from "@reduxjs/toolkit";
import { Zone } from "../../types";
import { Platform } from "../../types";

const defaultState = {
  platform: Platform.AWS,
  zones: [] as Zone[],
  isCompactMode: false,
};

const setPlatform = createAction<Platform>("SET_PLATFORM");
export const enableCompactMode = createAction<Platform>("ENABLE_COMPACT_MODE");
export const disableCompactMode = createAction<Platform>(
  "DISABLE_COMPACT_MODE"
);

const clusterReducer = createReducer(defaultState, (builder) => {
  builder.addCase(setPlatform, (state, { payload: platform }) => {
    state.platform = platform;
    state.zones = [];
    return state;
  });
  builder.addCase(enableCompactMode, (state) => {
    state.isCompactMode = true;
    return state;
  });
  builder.addCase(disableCompactMode, (state) => {
    state.isCompactMode = false;
    return state;
  });
});

export { setPlatform, clusterReducer };
