import { Service } from "./Service";

export type Workload = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: number[];
  storageCapacityRequired?: number;
};

export type WorkloadDescriptor = {
  id?: number;
  name: string;
  count: number;
  usesMachines: string[];
  services: Service[];
  storageCapacityRequired?: number;
};
