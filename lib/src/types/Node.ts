export type Node = {
  id: number;
  maxDisks: number;
  cpuUnits: number;
  memory: number;
  // String that we print for this node's size
  nodeSize?: string;
  // Name of the machineSet that created this node
  machineSet: string;
  // An array of workload ids
  workloads?: number[];
  // An array of service ids
  services: number[];
  // Instance Name
  instanceName?: string;
  // Only use this set for this particular workload
  // Default is to be used by any workload
  onlyFor: string[];
  // Control plane scheduling configuration
  isControlPlane?: boolean; // Mark as control plane node
  allowWorkloadScheduling?: boolean; // Allow user workloads
  controlPlaneReserved?: {
    // Resources reserved for control plane
    cpu: number;
    memory: number;
  };
};
