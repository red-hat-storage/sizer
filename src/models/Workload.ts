import { ServiceDescriptor } from "./Service";

export type Workload = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: number[];
  storageCapacityRequired?: number;
  duplicateOf?: number;
};

export type WorkloadDescriptor = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: ServiceDescriptor[];
  storageCapacityRequired?: number;
};
