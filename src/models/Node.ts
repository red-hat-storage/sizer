import { Workload } from "./Workload";
import { NodeDetails } from "../types";

export abstract class Node {
  maxDisks: number;
  cpuUnits: number;
  memory: number;
  // String that we print for this node's size
  nodeSize: string;
  // Name of the machineSet that created this node
  machineSet: string;
  // services: Array<Service>;
  workloads: Record<string, Workload>;

  constructor(
    maxDisks = 0,
    cpuUnits = 0,
    memory = 0,
    nodeSize = "",
    machineSet = ""
  ) {
    this.workloads = {};

    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }

  getUsedMemory(): number {
    let totalMemory = 0;
    for (const [, workload] of Object.entries(this.workloads)) {
      totalMemory += workload.getTotalMemory();
    }
    return totalMemory;
  }
  getUsedCPU(): number {
    let totalCores = 0;
    for (const [, workload] of Object.entries(this.workloads)) {
      totalCores += workload.getTotalCPU();
    }
    return 2 * Math.round(Math.ceil(totalCores) / 2);
  }
  canIAddWorkload(workload: Workload): boolean {
    let totalCPU = 0,
      totalMem = 0,
      totalDisks = 0;
    if (workload.name in this.workloads) {
      // If we already have services from that workload
      // we need to ensure that the same service does not already exist
      //  and that the existing services do not dislike
      // these new services
      const newServiceNames = workload.getNamesOfServices();
      for (const [, service] of Object.entries(
        this.workloads[workload.name].services
      )) {
        if (service.name in newServiceNames) {
          return false;
        }
        const intersection = service.avoid.filter((x) =>
          newServiceNames.includes(x)
        );
        if (intersection.length > 0) {
          return false;
        }
      }
    }
    for (const [, service] of Object.entries(workload.services)) {
      if (service.name == "Ceph_OSD") {
        totalDisks += 1;
      }
      totalMem += service.requiredMemory;
      totalCPU += service.requiredCPU;
    }
    if (
      this.getUsedCPU() + totalCPU > this.cpuUnits ||
      this.getUsedMemory() + totalMem > this.memory ||
      this.getAmountOfOSDs() + totalDisks > this.maxDisks
    ) {
      return false;
    }
    return true;
  }
  addWorkload(workload: Workload): boolean {
    if (!this.canIAddWorkload(workload)) {
      return false;
    }
    if (workload.name in this.workloads) {
      // We already have services from that workload
      // So we need to append the new services to the existing workload
      for (const [, newService] of Object.entries(workload.services)) {
        this.workloads[workload.name].services[newService.name] = newService;
      }
      return true;
    }
    this.workloads[workload.name] = workload;
    return true;
  }
  getAmountOfOSDs(): number {
    let osdCount = 0;
    for (const [, workload] of Object.entries(this.workloads)) {
      for (const [, service] of Object.entries(workload.services)) {
        if (service.name.startsWith("Ceph_OSD")) {
          osdCount++;
        }
      }
    }
    return osdCount;
  }
  getDetails(): NodeDetails<Workload> {
    return {
      usedCpuUnits: this.getUsedCPU(),
      usedMemory: this.getUsedMemory(),
      amountOfOSDs: this.getAmountOfOSDs(),
      workloads: this.workloads,
    };
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}

export class BareMetal extends Node {
  constructor(maxDisks = 24, cpuUnits = 24, memory = 64, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}

export class VMnode extends Node {
  // Per node we can have at most 30 disks per SATA adapter and
  // max 4 adapters = 120 disks in total (minus OS disk)
  // https://configmax.vmware.com/guest?vmwareproduct=vSphere&release=vSphere%207.0&categories=1-0

  constructor(maxDisks = 24, cpuUnits = 40, memory = 128, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}

export class AWSattached extends Node {
  // node storage i3en.2xl
  // 2 x 2.5TB disks
  constructor(maxDisks = 2, cpuUnits = 8, memory = 64, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = "i3en.2xlarge";
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    if (this.getAmountOfOSDs() == 0) {
      return "m5.2xlarge";
    }
    return "i3en.2xlarge";
  }
}

export class AWSEBS extends Node {
  // node with EBS based on m5 nodes

  // Linux nodes should not have more than 40 EBS volumes
  // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/volume_limits.html#linux-specific-volume-limits
  constructor(maxDisks = 24, cpuUnits = 16, memory = 64, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = "m5.4xlarge";
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}

export class GCP extends Node {
  // Based on findings e2-standard-16 is the best general instance
  // https://docs.google.com/document/d/1COHDVAVJCQovy1YKru9tZ5-GJv0cNXzVQ6t2m2c9-Jo/edit#
  // For high-IOPs n2-standard-16 is better

  constructor(maxDisks = 24, cpuUnits = 16, memory = 64, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = "e2-standard-16";
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}

export class Azure extends Node {
  // Based on our findings the D16s_v3 has a good performance and price
  // https://docs.google.com/document/d/1-SIa219F0T13Yn1MQMrsP7O1sw8Auy97GCiqfst0J74/edit#
  constructor(maxDisks = 24, cpuUnits = 16, memory = 64, machineSet = "") {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = "D16s_v3";
    this.machineSet = machineSet;
  }

  getFittingNodeSize(): string {
    return this.nodeSize;
  }
}
