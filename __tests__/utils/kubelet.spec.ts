import {
  getNodeKubeletMemoryRequirements,
  getNodeKubeletCPURequirements,
} from "../../src/utils/kubelet";

describe("getNodeKubeletMemoryRequirements", () => {
  it("should return 0.255 for nodeMemory less than 1", () => {
    const result = getNodeKubeletMemoryRequirements(0.5);
    expect(result).toBe(0.255);
  });

  it("should return 0 for nodeMemory equal to 1 (boundary: > 1 check fails)", () => {
    const result = getNodeKubeletMemoryRequirements(1);
    expect(result).toBe(0);
  });

  it("should return 0.75 for nodeMemory = 4 (25% of 3)", () => {
    const result = getNodeKubeletMemoryRequirements(4);
    expect(result).toBe(0.75);
  });

  it("should return 1.8 for nodeMemory = 8 (25% of 4 + 20% of 4)", () => {
    // Tier 1: 0.25 * 4 = 1.0, Tier 2: 0.2 * 4 = 0.8
    const result = getNodeKubeletMemoryRequirements(8);
    expect(result).toBeCloseTo(1.8, 4);
  });

  it("should return 2.6 for nodeMemory = 16 (1.8 + 10% of 8)", () => {
    // Tier 1: 1.0, Tier 2: 0.8, Tier 3: 0.1 * 8 = 0.8
    const result = getNodeKubeletMemoryRequirements(16);
    expect(result).toBeCloseTo(2.6, 4);
  });

  it("should return 9.32 for nodeMemory = 128 (2.6 + 6% of 112)", () => {
    // Tier 1: 1.0, Tier 2: 0.8, Tier 3: 0.8, Tier 4: 0.06 * 112 = 6.72
    const result = getNodeKubeletMemoryRequirements(128);
    expect(result).toBeCloseTo(9.32, 5);
  });

  it("should return 11.88 for nodeMemory = 256 (9.32 + 2% of 128)", () => {
    // Tier 1: 1.0, Tier 2: 0.8, Tier 3: 0.8, Tier 4: 6.72, Tier 5: 0.02 * 128 = 2.56
    const result = getNodeKubeletMemoryRequirements(256);
    expect(result).toBeCloseTo(11.88, 5);
  });
});

describe("getNodeKubeletCPURequirements", () => {
  it("should return 0.06 for nodeCPU = 1", () => {
    const result = getNodeKubeletCPURequirements(1);
    expect(result).toBe(0.06);
  });

  it("should return 0.07 for nodeCPU = 2 (0.06 + 0.01)", () => {
    const result = getNodeKubeletCPURequirements(2);
    expect(result).toBeCloseTo(0.07, 4);
  });

  it("should return 0.08 for nodeCPU = 4 (0.07 + 0.005 * 2)", () => {
    const result = getNodeKubeletCPURequirements(4);
    expect(result).toBeCloseTo(0.08, 4);
  });

  it("should return 0.09 for nodeCPU = 8 (0.08 + 0.0025 * 4)", () => {
    const result = getNodeKubeletCPURequirements(8);
    expect(result).toBeCloseTo(0.09, 4);
  });

  it("should return 0.31 for nodeCPU = 96 (0.08 + 0.0025 * 92)", () => {
    const result = getNodeKubeletCPURequirements(96);
    expect(result).toBeCloseTo(0.31, 4);
  });
});
