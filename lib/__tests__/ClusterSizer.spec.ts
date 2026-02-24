import { ClusterSizer } from '../src/core/ClusterSizer';
import { Platform } from '../src/types/common';
import { WorkloadDescriptor } from '../src/types/Workload';
import { MachineSet } from '../src/types/MachineSet';

describe('ClusterSizer', () => {
  describe('size()', () => {
    it('should calculate cluster size for basic workload', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'test-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'test-service',
              requiredCPU: 10,
              requiredMemory: 20,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);

      expect(result.nodeCount).toBeGreaterThan(0);
      expect(result.totalCPU).toBeGreaterThanOrEqual(10);
      expect(result.totalMemory).toBeGreaterThanOrEqual(20);
      expect(result.zones).toBe(1);
    });

    it('should handle multi-zone HA deployments', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'ha-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'ha-service',
              requiredCPU: 10,
              requiredMemory: 20,
              zones: 3,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);

      expect(result.zones).toBe(3);
      expect(result.nodeCount).toBeGreaterThanOrEqual(3);
    });

    it('should handle over-commitment with limits', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'overcommit-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'overcommit-service',
              requiredCPU: 10,
              requiredMemory: 20,
              limitCPU: 20,
              limitMemory: 40,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);

      expect(result.nodeCount).toBeGreaterThan(0);
      expect(result.totalCPU).toBeGreaterThan(0);
      expect(result.totalMemory).toBeGreaterThan(0);
    });


    it('should return detailed node and zone information', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'detailed-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'detailed-service',
              requiredCPU: 10,
              requiredMemory: 20,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);

      expect(result.nodes).toBeDefined();
      expect(result.zoneDetails).toBeDefined();
      expect(result.services).toBeDefined();
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.zoneDetails)).toBe(true);
      expect(Array.isArray(result.services)).toBe(true);
    });

    it('should handle multiple services in a workload', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'multi-service-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'service-1',
              requiredCPU: 5,
              requiredMemory: 10,
              zones: 1,
              runsWith: [],
              avoid: []
            },
            {
              name: 'service-2',
              requiredCPU: 5,
              requiredMemory: 10,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);

      expect(result.services?.length).toBe(2);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should throw error for unschedulable workload (CPU)', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'invalid-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'too-large-service',
              requiredCPU: 100,
              requiredMemory: 20,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      expect(() => {
        ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      }).toThrow();
    });

    it('should throw error for unschedulable workload (Memory)', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'invalid-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'memory-heavy-service',
              requiredCPU: 10,
              requiredMemory: 200,
              zones: 1,
              runsWith: [],
              avoid: []
            }
          ]
        }
      ];

      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 32,
          memory: 64,
          instanceName: 'worker-node',
          numberOfDisks: 4,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      expect(() => {
        ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      }).toThrow(/memory/i);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty workload list', () => {
      const workloads: WorkloadDescriptor[] = [];
      const machineSets: MachineSet[] = [
        {
          name: 'worker',
          cpu: 64,
          memory: 256,
          instanceName: 'worker-node',
          numberOfDisks: 24,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.AWS, machineSets);

      expect(result.nodeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Platform support', () => {
    const workloads: WorkloadDescriptor[] = [
      {
        name: 'test-workload',
        count: 1,
        usesMachines: ['worker'],
        services: [
          {
            name: 'test-service',
            requiredCPU: 10,
            requiredMemory: 20,
            zones: 1,
            runsWith: [],
            avoid: []
          }
        ]
      }
    ];

    const machineSets: MachineSet[] = [
      {
        name: 'worker',
        cpu: 32,
        memory: 64,
        instanceName: 'worker-node',
        numberOfDisks: 4,
        onlyFor: [],
        label: 'Worker'
      }
    ];

    it('should support AWS platform', () => {
      const result = ClusterSizer.size(workloads, Platform.AWS, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should support Azure platform', () => {
      const result = ClusterSizer.size(workloads, Platform.AZURE, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should support GCP platform', () => {
      const result = ClusterSizer.size(workloads, Platform.GCP, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should support BareMetal platform', () => {
      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should support IBM Classic platform', () => {
      const result = ClusterSizer.size(workloads, Platform.IBMC, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it('should support IBM VPC platform', () => {
      const result = ClusterSizer.size(workloads, Platform.IBMV, machineSets);
      expect(result.nodeCount).toBeGreaterThan(0);
    });
  });
});
