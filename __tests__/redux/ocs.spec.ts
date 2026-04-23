import { DeploymentType } from "../../src/types";
import {
  ocsReducer,
  setFlashSize,
  setUsableCapacity,
  setDeploymentType,
  setDedicatedMachines,
} from "../../src/redux/reducers/ocs";
import { enableCompactMode } from "../../src/redux/reducers/cluster";
import { Platform } from "../../src/types/common";

const defaultState = {
  flashSize: 2.5,
  usableCapacity: 10,
  deploymentType: DeploymentType.INTERNAL,
  nvmeTuning: false,
  cephFSActive: true,
  nooBaaActive: true,
  rgwActive: false,
  dedicatedMachines: [] as string[],
};

describe("OCS Reducer", () => {
  it("should return the default state", () => {
    const state = ocsReducer(undefined, { type: "INIT" });
    expect(state).toEqual(defaultState);
  });

  it("should handle setFlashSize", () => {
    const state = ocsReducer(defaultState, setFlashSize(5));
    expect(state.flashSize).toBe(5);
  });

  it("should handle setUsableCapacity", () => {
    const state = ocsReducer(defaultState, setUsableCapacity(20));
    expect(state.usableCapacity).toBe(20);
  });

  it("should handle setDeploymentType to EXTERNAL", () => {
    const state = ocsReducer(
      defaultState,
      setDeploymentType(DeploymentType.EXTERNAL)
    );
    expect(state.deploymentType).toBe(DeploymentType.EXTERNAL);
  });

  it("should handle setDeploymentType to MINIMAL", () => {
    const state = ocsReducer(
      defaultState,
      setDeploymentType(DeploymentType.MINIMAL)
    );
    expect(state.deploymentType).toBe(DeploymentType.MINIMAL);
  });

  it("should handle setDedicatedMachines", () => {
    const machines = ["machine-1", "machine-2"];
    const state = ocsReducer(defaultState, setDedicatedMachines(machines));
    expect(state.dedicatedMachines).toEqual(machines);
  });

  it("should handle enableCompactMode", () => {
    const state = ocsReducer(defaultState, enableCompactMode(Platform.AWS));
    expect(state.dedicatedMachines).toEqual(["compact-default"]);
    expect(state.deploymentType).toBe(DeploymentType.COMPACT);
  });

  it("should not modify other fields when setting flashSize", () => {
    const state = ocsReducer(defaultState, setFlashSize(10));
    expect(state.usableCapacity).toBe(defaultState.usableCapacity);
    expect(state.deploymentType).toBe(defaultState.deploymentType);
    expect(state.dedicatedMachines).toEqual(defaultState.dedicatedMachines);
  });
});
