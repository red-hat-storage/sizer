/*
name: tester
count: 3
usesMachines:
  - default
services:
  - name: serviceA
    requiredCPU: 5
    requiredMemory: 16
    zones: 3
    runsWith: []
    avoid: ["serviceB", "serviceC"]
  - name: serviceB
    requiredCPU: 5
    requiredMemory: 16
    zones: 3
    runsWith: ["serviceC"]
    avoid: ["serviceA"]
  - name: serviceC
    requiredCPU: 5
    requiredMemory: 16
    zones: 3
    runsWith: []
    avoid: ["serviceA"]
*/

import { WorkloadDescriptor } from "../../src/types";
import { getWorkloadFromDescriptors } from "../../src/utils/workload";

/**
 * A test to check the transformer for above workload
 */

const workloadDescription: WorkloadDescriptor = {
  name: "tester",
  count: 3,
  usesMachines: ["default"],
  services: [
    {
      name: "serviceA",
      requiredCPU: 5,
      requiredMemory: 16,
      zones: 3,
      runsWith: [],
      avoid: ["serviceB", "serviceC"],
    },
    {
      name: "serviceB",
      requiredCPU: 5,
      requiredMemory: 16,
      zones: 3,
      runsWith: ["serviceC"],
      avoid: ["serviceA"],
    },
    {
      name: "serviceC",
      requiredCPU: 5,
      requiredMemory: 16,
      zones: 3,
      runsWith: [],
      avoid: ["serviceA"],
    },
  ],
};

describe("Test utility functions around workload descriptors", () => {
  it("Test if Service object is properly formed", () => {
    const { services } = getWorkloadFromDescriptors(workloadDescription);
    const [sA, sB, sC] = services;
    expect(sA.runsWith).toEqual([]);
    expect(sA.avoid).toEqual([sB.id, sC.id]);
    expect(sB.runsWith).toEqual([sC.id]);
    expect(sB.avoid).toEqual([sA.id]);
    expect(sC.runsWith).toEqual([]);
    expect(sC.avoid).toEqual([sA.id]);
  });
  it("Test if Workload object is properly formed", () => {
    const { workload, services } =
      getWorkloadFromDescriptors(workloadDescription);
    expect(workload.services).toEqual(services.map((s) => s.id));
  });
});
