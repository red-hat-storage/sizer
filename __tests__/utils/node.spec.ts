import {
  getServicesInNode,
  getTotalNodeMemoryConsumption,
  getMaxZones,
  getOSDsInNode,
} from "../../src/utils/node";
import { Node, Service } from "../../src/types";

describe("Node utility functions", () => {
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
    {
      id: 2,
      name: "Ceph_OSD_0",
      requiredCPU: 2,
      requiredMemory: 5,
      zones: 1,
      runsWith: [],
      avoid: [],
    },
    {
      id: 3,
      name: "mgr",
      requiredCPU: 1,
      requiredMemory: 3,
      zones: 2,
      runsWith: [],
      avoid: [],
    },
  ];

  const node: Node = {
    id: 1,
    cpuUnits: 16,
    memory: 64,
    services: [1, 2],
    machineSet: "default",
    maxDisks: 24,
    onlyFor: [],
  };

  describe("getServicesInNode", () => {
    it("should return only services whose id is in the node's services array", () => {
      const result = getServicesInNode(node, services);

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toEqual([1, 2]);
    });

    it("should return an empty array when node has no services", () => {
      const emptyNode: Node = {
        id: 2,
        cpuUnits: 8,
        memory: 32,
        services: [],
        machineSet: "default",
        maxDisks: 24,
        onlyFor: [],
      };

      const result = getServicesInNode(emptyNode, services);

      expect(result).toHaveLength(0);
    });
  });

  describe("getTotalNodeMemoryConsumption", () => {
    it("should return the sum of requiredMemory for services on the node", () => {
      const result = getTotalNodeMemoryConsumption(node, services);

      // Services 1 and 2 have requiredMemory 2 and 5
      expect(result).toBe(7);
    });

    it("should return 0 for a node with no services", () => {
      const emptyNode: Node = {
        id: 2,
        cpuUnits: 8,
        memory: 32,
        services: [],
        machineSet: "default",
        maxDisks: 24,
        onlyFor: [],
      };

      const result = getTotalNodeMemoryConsumption(emptyNode, services);

      expect(result).toBe(0);
    });
  });

  describe("getMaxZones", () => {
    it("should return the maximum zones value across all services", () => {
      const result = getMaxZones(services);

      // zones values are 3, 1, 2 - max is 3
      expect(result).toBe(3);
    });

    it("should return the zone value for a single service", () => {
      const result = getMaxZones([services[1]]);

      expect(result).toBe(1);
    });
  });

  describe("getOSDsInNode", () => {
    it("should count services with 'OSD' in their name on the node", () => {
      const result = getOSDsInNode(node, services);

      // Only service 2 (Ceph_OSD_0) matches
      expect(result).toBe(1);
    });

    it("should return 0 when no OSD services are on the node", () => {
      const noOsdNode: Node = {
        id: 3,
        cpuUnits: 8,
        memory: 32,
        services: [1, 3],
        machineSet: "default",
        maxDisks: 24,
        onlyFor: [],
      };

      const result = getOSDsInNode(noOsdNode, services);

      expect(result).toBe(0);
    });

    it("should count multiple OSD services on a node", () => {
      const extraServices: Service[] = [
        ...services,
        {
          id: 4,
          name: "Ceph_OSD_1",
          requiredCPU: 2,
          requiredMemory: 5,
          zones: 1,
          runsWith: [],
          avoid: [],
        },
      ];
      const multiOsdNode: Node = {
        id: 4,
        cpuUnits: 16,
        memory: 64,
        services: [2, 4],
        machineSet: "default",
        maxDisks: 24,
        onlyFor: [],
      };

      const result = getOSDsInNode(multiOsdNode, extraServices);

      expect(result).toBe(2);
    });
  });
});
