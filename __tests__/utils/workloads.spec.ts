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

import { WorkloadDescriptor } from "../../src/models";
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
    expect(services[0].runsWith).toEqual([]);
    expect(services[0].avoid).toEqual([1, 2]);
    expect(services[1].runsWith).toEqual([2]);
    expect(services[1].avoid).toEqual([0]);
    expect(services[2].runsWith).toEqual([]);
    expect(services[2].avoid).toEqual([0]);
  });
  it("Test if Workload object is properly formed", () => {
    const { workload } = getWorkloadFromDescriptors(workloadDescription);
    expect(workload.services).toEqual([0, 1, 2]);
  });
});
