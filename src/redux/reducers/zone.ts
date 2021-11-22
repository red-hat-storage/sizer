import { createAction, createReducer } from "@reduxjs/toolkit";
import { Zone_ as Zone } from "../../models";

//
let ZONE_COUNTER = 0;

export const generateZoneID = (): number => ZONE_COUNTER++;

const defaultState = {
  zones: [] as Zone[],
};

const addZone = createAction<Zone>("ADD_ZONE");
const removeZone = createAction<Zone>("REMOVE_ZONE");
const updateZone = createAction<Zone>("UPDATE_ZONE");
const addNodesToZone =
  createAction<{ zoneId: number; nodes: number[] }>("ADD_NODE_TO_ZONE");

const zoneReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addZone, (state, { payload: zone }) => {
      state.zones.push(zone);
    })
    .addCase(removeZone, (state, { payload: zone }) => {
      state.zones.filter((z) => z.id !== zone.id);
    })
    .addCase(updateZone, (state, { payload: zone }) => {
      state.zones.map((z) => (z.id === zone.id ? zone : z));
    })
    .addCase(addNodesToZone, ({ zones }, { payload: { zoneId, nodes } }) => {
      const updateZone = zones.find((z) => z.id === zoneId) as Zone;
      updateZone.nodes = [...updateZone?.nodes, ...nodes];
    });
});

export { zoneReducer, addZone, removeZone, updateZone, addNodesToZone };
