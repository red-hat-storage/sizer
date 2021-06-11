import { Service } from "./Service";

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
  services: Record<string, Service>;
  // amount of persistent storage (in TB)
  // this workload is expected to consume
  // Used for ODF sizing
  storageCapacityRequired: number;

  constructor(
    name: string,
    services: Record<string, Service>,
    storageCapacityRequired: number,
    count = 1,
    usesMachines: string[] = []
  ) {
    this.name = name;
    this.services = services;
    this.storageCapacityRequired = storageCapacityRequired;
    this.count = count;
    this.usesMachines = usesMachines;
  }

  getTotalMemory(): number {
    let total = 0;
    for (const [, service] of Object.entries(this.services)) {
      total += service.requiredMemory;
    }
    return total;
  }

  getTotalCPU(): number {
    let total = 0;
    for (const [, service] of Object.entries(this.services)) {
      total += service.requiredCPU;
    }
    return total;
  }

  getNamesOfServices(): string[] {
    const serviceNames: string[] = [];
    for (const [, service] of Object.entries(this.services)) {
      serviceNames.push(service.name);
    }
    return serviceNames;
  }
}
