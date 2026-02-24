export type MachineSet = {
  id?: number;
  name: string;
  // Number of CPU units per node of this set
  cpu: number;
  // Number of memory in GB per node of this set
  memory: number;
  // The size of the nodes, use this for public cloud instance types
  instanceName: string;
  // Number of usable disks per node of this set
  // Default is 24
  numberOfDisks: number;
  // Only use this set for this particular workload
  // Default is to be used by any workload
  onlyFor: string[];
  // Node label to apply to Nodes created with this Set
  label: string;
  // Instance Storage is mapped from the Instances
  instanceStorage?: number;
  // Control plane scheduling configuration
  allowWorkloadScheduling?: boolean; // Allow user workloads on control plane nodes
  controlPlaneReserved?: {
    // Resources reserved for control plane
    cpu: number;
    memory: number;
  };
};
