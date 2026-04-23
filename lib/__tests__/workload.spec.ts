import {
  getWorkloadFromDescriptors,
  areServicesSchedulable,
  isWorkloadSchedulable,
  getWorkloadServices,
} from "../src/utils/workload";
import {
  WorkloadDescriptor,
  Service,
  MachineSet,
  Workload,
} from "../src/types";

describe("getWorkloadFromDescriptors", () => {
  it("should convert a WorkloadDescriptor into a Workload with numeric IDs and resolve runsWith references", () => {
    // Arrange
    const descriptor: WorkloadDescriptor = {
      name: "test-workload",
      count: 1,
      usesMachines: ["worker"],
      services: [
        {
          name: "service-a",
          requiredCPU: 4,
          requiredMemory: 8,
          zones: 1,
          runsWith: ["service-b"],
          avoid: [],
        },
        {
          name: "service-b",
          requiredCPU: 2,
          requiredMemory: 4,
          zones: 1,
          runsWith: ["service-a"],
          avoid: [],
        },
      ],
    };

    // Act
    const { workload, services } = getWorkloadFromDescriptors(descriptor);

    // Assert
    expect(workload.name).toBe("test-workload");
    expect(workload.id).toBeDefined();
    expect(workload.services).toHaveLength(2);

    expect(services).toHaveLength(2);
    const serviceA = services.find((s) => s.name === "service-a")!;
    const serviceB = services.find((s) => s.name === "service-b")!;

    // IDs should be assigned and unique
    expect(serviceA.id).toBeDefined();
    expect(serviceB.id).toBeDefined();
    expect(serviceA.id).not.toBe(serviceB.id);

    // runsWith should be resolved from string names to numeric IDs
    expect(serviceA.runsWith).toEqual([serviceB.id]);
    expect(serviceB.runsWith).toEqual([serviceA.id]);

    // avoid should be empty arrays (numeric)
    expect(serviceA.avoid).toEqual([]);
    expect(serviceB.avoid).toEqual([]);

    // workload.services should contain the service IDs
    expect(workload.services).toContain(serviceA.id);
    expect(workload.services).toContain(serviceB.id);
  });
});

describe("areServicesSchedulable", () => {
  it("should return true when services fit within the machine set resources", () => {
    // Arrange
    const services: Service[] = [
      {
        name: "small-service",
        requiredCPU: 2,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
        id: 100,
      },
    ];
    const machineSet: MachineSet = {
      name: "worker",
      cpu: 32,
      memory: 64,
      instanceName: "m5.4xlarge",
      numberOfDisks: 24,
      onlyFor: [],
      label: "Worker",
    };

    // Act
    const result = areServicesSchedulable(services, machineSet);

    // Assert
    expect(result).toBe(true);
  });

  it("should return true when services fit tightly within CPU budget", () => {
    // Arrange
    const services: Service[] = [
      {
        name: "cpu-heavy",
        requiredCPU: 30,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
        id: 101,
      },
    ];
    const machineSet: MachineSet = {
      name: "worker",
      cpu: 32,
      memory: 64,
      instanceName: "m5.4xlarge",
      numberOfDisks: 24,
      onlyFor: [],
      label: "Worker",
    };

    // Act
    const result = areServicesSchedulable(services, machineSet);

    // Assert
    // 30 CPU + kubelet overhead (~0.15) = ~30.15 < 32 => fits
    expect(result).toBe(true);
  });

  it("should return false when services exceed machine set memory", () => {
    // Arrange
    const services: Service[] = [
      {
        name: "memory-heavy",
        requiredCPU: 2,
        requiredMemory: 62,
        zones: 1,
        runsWith: [],
        avoid: [],
        id: 102,
      },
    ];
    const machineSet: MachineSet = {
      name: "worker",
      cpu: 32,
      memory: 64,
      instanceName: "m5.4xlarge",
      numberOfDisks: 24,
      onlyFor: [],
      label: "Worker",
    };

    // Act
    const result = areServicesSchedulable(services, machineSet);

    // Assert
    // 62 GB + kubelet overhead (~5.23 GB for 64 GB node) exceeds 64 GB capacity
    expect(result).toBe(false);
  });

  it("should return false when services exceed machine set CPU capacity", () => {
    // Arrange
    const services: Service[] = [
      {
        name: "cpu-overload",
        requiredCPU: 32,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
        id: 103,
      },
    ];
    const machineSet: MachineSet = {
      name: "small-worker",
      cpu: 32,
      memory: 64,
      instanceName: "m5.4xlarge",
      numberOfDisks: 24,
      onlyFor: [],
      label: "Worker",
    };

    // Act
    const result = areServicesSchedulable(services, machineSet);

    // Assert
    // 32 CPU + kubelet overhead exceeds 32 CPU capacity
    expect(result).toBe(false);
  });
});

describe("isWorkloadSchedulable", () => {
  it("should return [true, matchingMachineSets] when the workload specifies usesMachines and fits", () => {
    // Arrange
    const { workload, services } = getWorkloadFromDescriptors({
      name: "preferred-workload",
      count: 1,
      usesMachines: ["gpu-worker"],
      services: [
        {
          name: "gpu-service",
          requiredCPU: 4,
          requiredMemory: 8,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ],
    });

    const machineSets: MachineSet[] = [
      {
        name: "worker",
        cpu: 16,
        memory: 32,
        instanceName: "m5.2xlarge",
        numberOfDisks: 4,
        onlyFor: [],
        label: "Worker",
      },
      {
        name: "gpu-worker",
        cpu: 32,
        memory: 64,
        instanceName: "p3.2xlarge",
        numberOfDisks: 4,
        onlyFor: [],
        label: "GPU Worker",
      },
    ];

    // Act
    const [schedulable, matchedSets] = isWorkloadSchedulable(
      services,
      machineSets
    )(workload);

    // Assert
    expect(schedulable).toBe(true);
    expect(matchedSets.length).toBeGreaterThan(0);
    expect(matchedSets.every((ms) => ms.name === "gpu-worker")).toBe(true);
  });

  it("should return [true, matchingMachineSets] when the workload has no machine preference", () => {
    // Arrange
    const { workload, services } = getWorkloadFromDescriptors({
      name: "generic-workload",
      count: 1,
      usesMachines: [],
      services: [
        {
          name: "generic-service",
          requiredCPU: 2,
          requiredMemory: 4,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ],
    });

    const machineSets: MachineSet[] = [
      {
        name: "worker",
        cpu: 32,
        memory: 64,
        instanceName: "m5.4xlarge",
        numberOfDisks: 24,
        onlyFor: [],
        label: "Worker",
      },
    ];

    // Act
    const [schedulable, matchedSets] = isWorkloadSchedulable(
      services,
      machineSets
    )(workload);

    // Assert
    expect(schedulable).toBe(true);
    expect(matchedSets.length).toBeGreaterThan(0);
  });

  it("should return [false, []] when no machine set can handle the workload", () => {
    // Arrange
    const { workload, services } = getWorkloadFromDescriptors({
      name: "huge-workload",
      count: 1,
      usesMachines: [],
      services: [
        {
          name: "huge-service",
          requiredCPU: 100,
          requiredMemory: 200,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ],
    });

    const machineSets: MachineSet[] = [
      {
        name: "small-worker",
        cpu: 16,
        memory: 32,
        instanceName: "m5.xlarge",
        numberOfDisks: 4,
        onlyFor: [],
        label: "Small Worker",
      },
    ];

    // Act
    const [schedulable, matchedSets] = isWorkloadSchedulable(
      services,
      machineSets
    )(workload);

    // Assert
    expect(schedulable).toBe(false);
    expect(matchedSets).toEqual([]);
  });
});

describe("getWorkloadServices", () => {
  it("should return only the services belonging to the given workload", () => {
    // Arrange
    const workload: Workload = {
      id: 1,
      name: "my-workload",
      count: 1,
      usesMachines: [],
      services: [10, 20],
    };

    const allServices: Service[] = [
      {
        id: 10,
        name: "svc-a",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        id: 20,
        name: "svc-b",
        requiredCPU: 2,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        id: 30,
        name: "svc-c",
        requiredCPU: 3,
        requiredMemory: 6,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ];

    // Act
    const result = getWorkloadServices(workload, allServices);

    // Assert
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(
      expect.arrayContaining(["svc-a", "svc-b"])
    );
    expect(result.map((s) => s.name)).not.toContain("svc-c");
  });

  it("should return an empty array when no services match", () => {
    // Arrange
    const workload: Workload = {
      id: 1,
      name: "empty-workload",
      count: 1,
      usesMachines: [],
      services: [999],
    };

    const allServices: Service[] = [
      {
        id: 10,
        name: "svc-a",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ];

    // Act
    const result = getWorkloadServices(workload, allServices);

    // Assert
    expect(result).toHaveLength(0);
  });
});
