import { ServiceDescriptor } from "./Service";

export type Workload = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: number[];
  storageCapacityRequired?: number;
  duplicateOf?: number;
  // Control plane scheduling configuration
  allowControlPlane?: boolean; // Can run on control plane nodes
  requireControlPlane?: boolean; // Must run on control plane nodes
};

export type WorkloadDescriptor = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: ServiceDescriptor[];
  storageCapacityRequired?: number;
  // Control plane scheduling configuration
  allowControlPlane?: boolean; // Can run on control plane nodes
  requireControlPlane?: boolean; // Must run on control plane nodes
};
