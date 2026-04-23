import {
  getMachineSetForWorkload,
  getRequiredZones,
  getCoplacedServices,
  getAvoidedServiceIds,
  sortServices,
} from "../../src/utils/service";
import { MachineSet, Service, Workload, Zone } from "../../src/types";

describe("Service utility functions", () => {
  describe("getMachineSetForWorkload", () => {
    const machineSets: MachineSet[] = [
      {
        name: "default",
        cpu: 16,
        memory: 64,
        numberOfDisks: 24,
        onlyFor: [],
        label: "worker",
        instanceName: "m5.4xlarge",
      },
      {
        name: "dedicated-rgw",
        cpu: 8,
        memory: 32,
        numberOfDisks: 12,
        onlyFor: ["RGW"],
        label: "rgw-node",
        instanceName: "m5.2xlarge",
      },
      {
        name: "storage",
        cpu: 32,
        memory: 128,
        numberOfDisks: 24,
        onlyFor: [],
        label: "storage-node",
        instanceName: "m5.8xlarge",
      },
    ];

    it("should return dedicated MachineSet when onlyFor includes workload name", () => {
      const workload: Workload = {
        name: "RGW",
        services: [1],
        usesMachines: [],
        count: 1,
      };

      const result = getMachineSetForWorkload(workload, machineSets);

      expect(result.name).toBe("dedicated-rgw");
    });

    it("should return MachineSet matching usesMachines when set", () => {
      const workload: Workload = {
        name: "OCS",
        services: [1, 2],
        usesMachines: ["storage"],
        count: 1,
      };

      const result = getMachineSetForWorkload(workload, machineSets);

      expect(result.name).toBe("storage");
    });

    it("should fall back to the first MachineSet when no dedicated or usesMachines match", () => {
      const workload: Workload = {
        name: "Generic",
        services: [1],
        usesMachines: [],
        count: 1,
      };

      const result = getMachineSetForWorkload(workload, machineSets);

      expect(result.name).toBe("default");
    });
  });

  describe("getRequiredZones", () => {
    it("should return the deficit when service needs more zones than available", () => {
      const service: Service = {
        id: 1,
        name: "mon",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 3,
        runsWith: [],
        avoid: [],
      };
      const zones: Zone[] = [{ id: 1, nodes: [1] }];

      const result = getRequiredZones(service, zones);

      expect(result).toBe(2);
    });

    it("should return 0 when enough zones already exist", () => {
      const service: Service = {
        id: 1,
        name: "mon",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 3,
        runsWith: [],
        avoid: [],
      };
      const zones: Zone[] = [
        { id: 1, nodes: [1] },
        { id: 2, nodes: [2] },
        { id: 3, nodes: [3] },
      ];

      const result = getRequiredZones(service, zones);

      expect(result).toBe(0);
    });

    it("should return 0 when service only needs 1 zone and more exist", () => {
      const service: Service = {
        id: 1,
        name: "mgr",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      };
      const zones: Zone[] = [
        { id: 1, nodes: [1] },
        { id: 2, nodes: [2] },
        { id: 3, nodes: [3] },
      ];

      const result = getRequiredZones(service, zones);

      expect(result).toBe(0);
    });
  });

  describe("getCoplacedServices", () => {
    const services: Service[] = [
      {
        id: 1,
        name: "mon",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 3,
        runsWith: [2],
        avoid: [],
      },
      {
        id: 2,
        name: "mgr",
        requiredCPU: 1,
        requiredMemory: 3,
        zones: 3,
        runsWith: [1],
        avoid: [],
      },
      {
        id: 3,
        name: "osd",
        requiredCPU: 2,
        requiredMemory: 5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ];

    it("should return the candidate plus services whose id is in candidate.runsWith", () => {
      const candidate = services[0]; // mon, runsWith: [2]

      const result = getCoplacedServices(candidate, services);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1); // candidate itself
      expect(result[1].id).toBe(2); // coplaced service
    });

    it("should return only the candidate when runsWith is empty", () => {
      const candidate = services[2]; // osd, runsWith: []

      const result = getCoplacedServices(candidate, services);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });
  });

  describe("getAvoidedServiceIds", () => {
    it("should collect all avoid arrays into a flat array", () => {
      const services: Service[] = [
        {
          id: 1,
          name: "mon",
          requiredCPU: 1,
          requiredMemory: 2,
          zones: 3,
          runsWith: [],
          avoid: [3],
        },
        {
          id: 2,
          name: "mgr",
          requiredCPU: 1,
          requiredMemory: 3,
          zones: 3,
          runsWith: [],
          avoid: [3, 4],
        },
      ];

      const result = getAvoidedServiceIds(services);

      expect(result).toEqual([3, 3, 4]);
    });

    it("should return an empty array when no services have avoids", () => {
      const services: Service[] = [
        {
          id: 1,
          name: "mon",
          requiredCPU: 1,
          requiredMemory: 2,
          zones: 3,
          runsWith: [],
          avoid: [],
        },
      ];

      const result = getAvoidedServiceIds(services);

      expect(result).toEqual([]);
    });
  });

  describe("sortServices", () => {
    it("should sort service groups by total resource consumption descending", () => {
      const groupA: Service[] = [
        {
          id: 1,
          name: "small",
          requiredCPU: 1,
          requiredMemory: 2,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];
      const groupB: Service[] = [
        {
          id: 2,
          name: "large",
          requiredCPU: 4,
          requiredMemory: 8,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];

      // sortServices returns positive when B > A (descending order)
      const result = sortServices(groupA, groupB);

      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 when both groups have equal total resources", () => {
      const groupA: Service[] = [
        {
          id: 1,
          name: "svc-a",
          requiredCPU: 2,
          requiredMemory: 4,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];
      const groupB: Service[] = [
        {
          id: 2,
          name: "svc-b",
          requiredCPU: 2,
          requiredMemory: 4,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];

      const result = sortServices(groupA, groupB);

      expect(result).toBe(0);
    });

    it("should return negative when first group has more resources", () => {
      const groupA: Service[] = [
        {
          id: 1,
          name: "large",
          requiredCPU: 8,
          requiredMemory: 16,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];
      const groupB: Service[] = [
        {
          id: 2,
          name: "small",
          requiredCPU: 1,
          requiredMemory: 1,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];

      const result = sortServices(groupA, groupB);

      expect(result).toBeLessThan(0);
    });
  });
});
