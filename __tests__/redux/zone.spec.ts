import { Zone } from "../../src/types";
import {
  zoneReducer,
  addZone,
  removeZone,
  addNodesToZone,
  removeAllZones,
  generateZoneID,
} from "../../src/redux/reducers/zone";

const defaultState = {
  zones: [] as Zone[],
};

describe("Zone Reducer", () => {
  it("should return the default state", () => {
    const state = zoneReducer(undefined, { type: "INIT" });
    expect(state).toEqual(defaultState);
  });

  it("should handle addZone", () => {
    const zone: Zone = { id: 1, nodes: [0, 1, 2] };
    const state = zoneReducer(defaultState, addZone(zone));
    expect(state.zones).toHaveLength(1);
    expect(state.zones[0]).toEqual(zone);
  });

  it("should handle adding multiple zones", () => {
    const zone1: Zone = { id: 1, nodes: [0] };
    const zone2: Zone = { id: 2, nodes: [1] };
    let state = zoneReducer(defaultState, addZone(zone1));
    state = zoneReducer(state, addZone(zone2));
    expect(state.zones).toHaveLength(2);
    expect(state.zones[0]).toEqual(zone1);
    expect(state.zones[1]).toEqual(zone2);
  });

  it("should handle removeZone", () => {
    const zone1: Zone = { id: 1, nodes: [0] };
    const zone2: Zone = { id: 2, nodes: [1] };
    const stateWithZones = { zones: [zone1, zone2] };
    const state = zoneReducer(stateWithZones, removeZone(zone1));
    expect(state.zones).toHaveLength(1);
    expect(state.zones[0]).toEqual(zone2);
  });

  it("should handle removeZone when zone does not exist", () => {
    const zone1: Zone = { id: 1, nodes: [0] };
    const nonExistent: Zone = { id: 99, nodes: [] };
    const stateWithZones = { zones: [zone1] };
    const state = zoneReducer(stateWithZones, removeZone(nonExistent));
    expect(state.zones).toHaveLength(1);
    expect(state.zones[0]).toEqual(zone1);
  });

  it("should handle addNodesToZone", () => {
    const zone: Zone = { id: 1, nodes: [0] };
    const stateWithZone = { zones: [zone] };
    const state = zoneReducer(
      stateWithZone,
      addNodesToZone({ zoneId: 1, nodes: [1, 2] })
    );
    expect(state.zones[0].nodes).toEqual([0, 1, 2]);
  });

  it("should handle removeAllZones", () => {
    const zone1: Zone = { id: 1, nodes: [0] };
    const zone2: Zone = { id: 2, nodes: [1] };
    const stateWithZones = { zones: [zone1, zone2] };
    const state = zoneReducer(stateWithZones, removeAllZones());
    expect(state.zones).toHaveLength(0);
  });

  it("should generate incrementing zone IDs", () => {
    const id1 = generateZoneID();
    const id2 = generateZoneID();
    expect(id2).toBe(id1 + 1);
  });
});
