import { Service } from "./Service";

export type Workload = {
  uid?: string;
  name: string;
  count: number;
  usesMachines: string[];
  services: Service[];
  storageCapacityRequired?: number;
};

export const getTotalMemory = (wl: Workload): number =>
  wl.services.reduce((total, service) => (total += service.requiredMemory), 0);

export const getTotalCPU = (wl: Workload): number =>
  wl.services.reduce((total, service) => (total += service.requiredCPU), 0);

export const getNamesOfServices = (wl: Workload): string[] =>
  wl.services.map((service) => service.name);
