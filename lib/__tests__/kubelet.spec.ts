import {
  getNodeKubeletMemoryRequirements,
  getNodeKubeletCPURequirements,
} from "../src/utils/kubelet";

describe("getNodeKubeletMemoryRequirements", () => {
  it("should return 0.255 for nodes with less than 1 GB of memory", () => {
    // Arrange
    const nodeMemory = 0.5;

    // Act
    const result = getNodeKubeletMemoryRequirements(nodeMemory);

    // Assert
    expect(result).toBe(0.255);
  });

  it("should return 0 for a node with exactly 1 GB of memory (boundary)", () => {
    // Arrange
    const nodeMemory = 1;

    // Act
    const result = getNodeKubeletMemoryRequirements(nodeMemory);

    // Assert
    expect(result).toBe(0);
  });

  it("should return 0.75 for a node with 4 GB of memory", () => {
    // Arrange
    const nodeMemory = 4;

    // Act
    const result = getNodeKubeletMemoryRequirements(nodeMemory);

    // Assert
    expect(result).toBe(0.75);
  });

  it("should return 1.8 for a node with 8 GB of memory", () => {
    const result = getNodeKubeletMemoryRequirements(8);
    expect(result).toBeCloseTo(1.8, 4);
  });

  it("should return 2.6 for a node with 16 GB of memory", () => {
    const result = getNodeKubeletMemoryRequirements(16);
    expect(result).toBeCloseTo(2.6, 4);
  });

  it("should return 9.32 for a node with 128 GB of memory", () => {
    const result = getNodeKubeletMemoryRequirements(128);
    expect(result).toBeCloseTo(9.32, 2);
  });

  it("should return 11.88 for a node with 256 GB of memory", () => {
    const result = getNodeKubeletMemoryRequirements(256);
    expect(result).toBeCloseTo(11.88, 2);
  });
});

describe("getNodeKubeletCPURequirements", () => {
  it("should return 0.06 for a node with 1 CPU", () => {
    // Arrange
    const nodeCPU = 1;

    // Act
    const result = getNodeKubeletCPURequirements(nodeCPU);

    // Assert
    expect(result).toBe(0.06);
  });

  it("should return 0.07 for a node with 2 CPUs", () => {
    // Arrange
    const nodeCPU = 2;

    // Act
    const result = getNodeKubeletCPURequirements(nodeCPU);

    // Assert
    expect(result).toBeCloseTo(0.07, 4);
  });

  it("should return 0.08 for a node with 4 CPUs", () => {
    // Arrange
    const nodeCPU = 4;

    // Act
    const result = getNodeKubeletCPURequirements(nodeCPU);

    // Assert
    expect(result).toBeCloseTo(0.08, 4);
  });

  it("should return 0.09 for a node with 8 CPUs", () => {
    // Arrange
    const nodeCPU = 8;

    // Act
    const result = getNodeKubeletCPURequirements(nodeCPU);

    // Assert
    expect(result).toBeCloseTo(0.09, 4);
  });

  it("should return 0.31 for a node with 96 CPUs", () => {
    // Arrange
    const nodeCPU = 96;

    // Act
    const result = getNodeKubeletCPURequirements(nodeCPU);

    // Assert
    expect(result).toBeCloseTo(0.31, 4);
  });
});
