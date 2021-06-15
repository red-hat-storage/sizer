import { Service } from "./Service";

type Services = {
  [serviceName: string]: Service;
};

export class Workload {
  // Name of the workload
  name: string;
  // Amount of times we want to have this workload
  count: number; // Default 1
  // Machineset to use for this workload
  // Default is to use ANY machineset
  // If set, only the first one will be ever used right now
  usesMachines: string[];
  // services to run this workload
  services: Services;
  // amount of persistent storage (in TB)
  // this workload is expected to consume
  // Used for ODF sizing
  storageCapacityRequired: number;

  constructor(
    name: string,
    services: Service[],
    storageCapacityRequired: number,
    count = 1,
    usesMachines: string[] = []
  ) {
    this.name = name;
    this.services = services.reduce((acc: Services, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {} as Services);
    this.storageCapacityRequired = storageCapacityRequired;
    this.count = count;
    this.usesMachines = usesMachines;
  }

  getTotalMemory(): number {
    return Object.values(this.services).reduce(
      (total, service) => (total += service.requiredMemory),
      0
    );
  }

  getTotalCPU(): number {
    return Object.values(this.services).reduce(
      (total, service) => (total += service.requiredCPU),
      0
    );
  }

  getNamesOfServices(): string[] {
    return Object.keys(this.services);
  }
}
