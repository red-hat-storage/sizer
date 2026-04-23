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

  describe('Large node sizes', () => {
    // These tests verify cap behaviour in error messages (see MAX_SUGGESTED_CPU_CORES / MAX_SUGGESTED_MEMORY_GB
    // in ClusterSizer.ts). They complement the existing 'should throw error for unschedulable workload'
    // tests, which only assert that an error is thrown — not what the message says.

    it('should successfully schedule a workload on a 300-CPU / 3000-GB node', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'large-workload',
          count: 1,
          usesMachines: [],
          services: [
            {
              name: 'large-service',
              requiredCPU: 250,
              requiredMemory: 1800,
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
          cpu: 300,
          memory: 3000,
          instanceName: 'giant-node',
          numberOfDisks: 24,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      const result = ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      expect(result.nodeCount).toBeGreaterThanOrEqual(1);
      expect(result.totalCPU).toBeGreaterThanOrEqual(250);    // at least enough for the service's requiredCPU
      expect(result.totalMemory).toBeGreaterThanOrEqual(1800); // at least enough for the service's requiredMemory
    });

    it('should cap the CPU suggestion at 384 in the unschedulable error message', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'impossible-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'huge-service',
              requiredCPU: 500,
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
          instanceName: 'small-node',
          numberOfDisks: 24,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      // MAX_SUGGESTED_CPU_CORES = 384, defined in ClusterSizer.ts
      expect(() => {
        ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      }).toThrow(/at least 384 CPU and \d+ GB/);
    });

    it('should cap the memory suggestion at 4096 in the unschedulable error message', () => {
      const workloads: WorkloadDescriptor[] = [
        {
          name: 'impossible-workload',
          count: 1,
          usesMachines: ['worker'],
          services: [
            {
              name: 'huge-service',
              requiredCPU: 10,
              requiredMemory: 5000,
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
          instanceName: 'small-node',
          numberOfDisks: 24,
          onlyFor: [],
          label: 'Worker'
        }
      ];

      // MAX_SUGGESTED_MEMORY_GB = 4096, defined in ClusterSizer.ts
      expect(() => {
        ClusterSizer.size(workloads, Platform.BAREMETAL, machineSets);
      }).toThrow(/at least \d+ CPU and 4096 GB/);
    });
  });
});
