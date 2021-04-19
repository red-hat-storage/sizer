import Service, { Ceph_OSD } from "./Service";
import { NodeDetails } from "../types";

export abstract class Node {
  maxDisks: number;
  cpuUnits: number;
  memory: number;
  // OCP "cost" that we need to take into account for sizing
  ocpCPUUnits: number;
  ocpMemory: number;
  services: Array<Service>;
  // Zone is either AZ or Rack
  zone: string;

  constructor(zone = "", maxDisks = 0, cpuUnits = 0, memory = 0) {
    this.services = [];

    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.ocpCPUUnits = 0;
    this.ocpMemory = 0;
    this.zone = zone;
  }

  getUsedMemory(): number {
    let totalMemory = 0;
    this.services.forEach((service) => {
      totalMemory += service.requiredMemory;
    });
    return totalMemory;
  }
  getUsedCPU(): number {
    let totalCores = 0;
    this.services.forEach((service) => {
      totalCores += service.requiredCPU;
    });
    return 2 * Math.round(Math.ceil(totalCores) / 2);
  }
  canIAddService(service: Service): boolean {
    if (
      this.getUsedCPU() + this.ocpCPUUnits + service.requiredCPU >
        this.cpuUnits ||
      this.getUsedMemory() + this.ocpMemory + service.requiredMemory >
        this.memory
    ) {
      return false;
    }
    if (
      service instanceof Ceph_OSD &&
      this.getAmountOfOSDs() >= this.maxDisks
    ) {
      return false;
    }
    return true;
  }
  addOCPService(cpuUnits: number, memory: number): void {
    this.ocpCPUUnits += cpuUnits;
    this.ocpMemory += memory;
  }
  addService(service: Service): boolean {
    if (this.canIAddService(service)) {
      this.services.push(service);
      return true;
    }
    return false;
  }
  getAmountOfOSDs(): number {
    let osdCount = 0;
    this.services.forEach((service) => {
      if (service instanceof Ceph_OSD) {
        osdCount++;
      }
    });
    return osdCount;
  }
  nodeHasService(service: Service): boolean {
    this.services.forEach((nodeService) => {
      if (nodeService instanceof Object.getPrototypeOf(service)) {
        return true;
      }
    });
    return false;
  }

  getDetails(): NodeDetails<Service> {
    return {
      usedCpuUnits: this.getUsedCPU(),
      usedMemory: this.getUsedMemory(),
      amountOfOSDs: this.getAmountOfOSDs(),
      services: this.services,
    };
  }
  /*
  print(indentation = ""): string {
    let message = '<div class="node-list">';
    message += `<div class="node-list__title">${indentation} This node has ${this.getUsedCPU()}/${
      this.cpuUnits
    } used CPU units, ${this.getUsedMemory()}/${
      this.memory
    } used GB of memory and ${this.getAmountOfOSDs()}/${
      this.maxDisks
    } disks.</div>`;
    message +=
      indentation +
      "<div class='node-list__subtitle'>SERVICES ON THIS Node:</div>";
    this.services.forEach((service) => {
      message += `<div class="node-list__item">${service.print(
        indentation + indentation
      )}</div>`;
    });
    message += "</div>";
    return message;
  }
*/
  abstract getFittingNodeSize(): string;
}

export class BareMetal extends Node {
  constructor(zone = "", maxDisks = 24, cpuUnits = 24, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
  }

  getFittingNodeSize(): string {
    return `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
  }
}

export class VMnode extends Node {
  // Per node we can have at most 30 disks per SATA adapter and
  // max 4 adapters = 120 disks in total (minus OS disk)
  // https://configmax.vmware.com/guest?vmwareproduct=vSphere&release=vSphere%207.0&categories=1-0

  constructor(zone = "", maxDisks = 24, cpuUnits = 40, memory = 128) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
  }

  getFittingNodeSize(): string {
    return `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
  }
}

export class AWSattached extends Node {
  // node storage i3en.2xl
  // 2 x 2.5TB disks
  constructor(zone = "", maxDisks = 2, cpuUnits = 8, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
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
  constructor(zone = "", maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
  }

  getFittingNodeSize(): string {
    return "m5.4xlarge";
  }
}

export class GCP extends Node {
  // Based on findings e2-standard-16 is the best general instance
  // https://docs.google.com/document/d/1COHDVAVJCQovy1YKru9tZ5-GJv0cNXzVQ6t2m2c9-Jo/edit#
  // For high-IOPs n2-standard-16 is better

  constructor(zone = "", maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
  }

  getFittingNodeSize(): string {
    return "e2-standard-16";
  }
}

export class Azure extends Node {
  // Based on our findings the D16s_v3 has a good performance and price
  // https://docs.google.com/document/d/1-SIa219F0T13Yn1MQMrsP7O1sw8Auy97GCiqfst0J74/edit#
  constructor(zone = "", maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.zone = zone;
  }

  getFittingNodeSize(): string {
    return "D16s_v3";
  }
}
