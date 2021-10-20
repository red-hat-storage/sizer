import {
  getNamesOfServices,
  getTotalCPU,
  getTotalMemory,
  Workload,
} from "./Workload";
import { NodeDetails } from "../types";
import * as _ from "lodash";

export abstract class Node {
  maxDisks: number;
  cpuUnits: number;
  memory: number;
  // String that we print for this node's size
  nodeSize: string;
  // Name of the machineSet that created this node
  machineSet: string;
  // services: Array<Service>;
  workloads: {
    [workloadName: string]: Workload;
  };

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

  getFittingNodeSize(): string {
    return this.nodeSize;
  }

  getUsedMemory(): number {
    return Object.values(this.workloads).reduce(
      (totalMemory, workload) => (totalMemory += getTotalMemory(workload)),
      0
    );
  }

  getUsedCPU(): number {
    const totalCores = Object.values(this.workloads).reduce(
      (totalCores, workload) => (totalCores += getTotalCPU(workload)),
      0
    );
    return 2 * Math.round(Math.ceil(totalCores) / 2);
  }

  canIAddWorkload(workload: Workload): boolean {
    if (workload.name in this.workloads) {
      // If we already have services from that workload
      // we need to ensure that the same service does not already exist
      //  and that the existing services do not dislike
      // these new services
      const newServices = Object.values(workload.services);
      const newServiceNames = getNamesOfServices(workload);
      const existingServices = Object.values(
        this.workloads[workload.name].services
      );
      const existingServiceNames = existingServices.map(
        (service) => service.name
      );
      const existingServicesAvoid = _.flatten(
        existingServices.map((service) => service.avoid)
      );
      const newServicesAvoid = _.flatten(
        newServices.map((service) => service.avoid)
      );

      if (_.intersection(newServiceNames, existingServiceNames).length > 0) {
        return false;
      }

      if (_.intersection(newServiceNames, existingServicesAvoid).length > 0) {
        return false;
      }

      if (_.intersection(newServicesAvoid, existingServiceNames).length > 0) {
        return false;
      }
    }
    const { totalMem, totalCPU, totalDisks } = Object.values(
      workload.services
    ).reduce(
      (acc, service) => {
        if (service.name === "Ceph_OSD") {
          acc.totalDisks += 1;
        }
        acc.totalMem += service.requiredMemory;
        acc.totalCPU += service.requiredCPU;
        return acc;
      },
      { totalMem: 0, totalCPU: 0, totalDisks: 0 }
    );

    if (
      this.getUsedCPU() + totalCPU > this.cpuUnits ||
      this.getUsedMemory() + totalMem > this.memory ||
      this.getAmountOfOSDs() + totalDisks > this.maxDisks
    ) {
      return false;
    }
    return true;
  }

  addWorkload(workload: Workload, workloadName: string): boolean {
    if (!this.canIAddWorkload(workload)) {
      return false;
    }
    if (workloadName in this.workloads) {
      // We already have services from that workload
      // So we need to append the new services to the existing workload
      /*       for (const [, newService] of Object.entries(workload.services)) {
        this.workloads[workloadName].services[newService.name] = newService;
      } */
      Object.values(workload.services).forEach((service) => {
        this.workloads[workloadName].services.push(service);
      });

      return true;
    }
    this.workloads[workloadName] = workload;
    return true;
  }

  getAmountOfOSDs(): number {
    /*     let osdCount = 0;
    for (const [, workload] of Object.entries(this.workloads)) {
      for (const [, service] of Object.entries(workload.services)) {
        if (service.name.startsWith("Ceph_OSD")) {
          osdCount++;
        }
      }
    } */
    const services = _.flatten(
      Object.values(this.workloads)
        .map((workload) => workload.services)
        .map((service) => Object.values(service))
    );
    const osdServices = services.filter((service) =>
      service.name.startsWith("Ceph_OSD")
    );
    return osdServices.length;
  }

  getDetails(): NodeDetails<Workload> {
    return {
      usedCpuUnits: this.getUsedCPU(),
      usedMemory: this.getUsedMemory(),
      amountOfOSDs: this.getAmountOfOSDs(),
      // We should just return workload Objects and not a hashmap
      // Revisit this
      workloads: this.workloads,
    };
  }
}

export class BareMetal extends Node {
  constructor(
    maxDisks = 24,
    cpuUnits = 24,
    memory = 64,
    machineSet = "",
    nodeSize = ""
  ) {
    super();
    if (nodeSize == "") {
      nodeSize = `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
    }
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }
}

export class VMnode extends Node {
  // Per node we can have at most 30 disks per SATA adapter and
  // max 4 adapters = 120 disks in total (minus OS disk)
  // https://configmax.vmware.com/guest?vmwareproduct=vSphere&release=vSphere%207.0&categories=1-0

  constructor(
    maxDisks = 24,
    cpuUnits = 40,
    memory = 128,
    machineSet = "",
    nodeSize = ""
  ) {
    super();
    if (nodeSize == "") {
      nodeSize = `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
    }
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }
}

export class AWSEBS extends Node {
  // node with EBS based on m5 nodes

  // Linux nodes should not have more than 40 EBS volumes
  // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/volume_limits.html#linux-specific-volume-limits
  constructor(
    maxDisks = 24,
    cpuUnits = 16,
    memory = 64,
    machineSet = "",
    nodeSize = "m5.4xlarge"
  ) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }
}

export class GCP extends Node {
  // Based on findings e2-standard-16 is the best general instance
  // https://docs.google.com/document/d/1COHDVAVJCQovy1YKru9tZ5-GJv0cNXzVQ6t2m2c9-Jo/edit#
  // For high-IOPs n2-standard-16 is better

  constructor(
    maxDisks = 24,
    cpuUnits = 16,
    memory = 64,
    machineSet = "",
    nodeSize = "e2-standard-16"
  ) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }
}

export class Azure extends Node {
  // Based on our findings the D16s_v3 has a good performance and price
  // https://docs.google.com/document/d/1-SIa219F0T13Yn1MQMrsP7O1sw8Auy97GCiqfst0J74/edit#
  constructor(
    maxDisks = 24,
    cpuUnits = 16,
    memory = 64,
    machineSet = "",
    nodeSize = "D16s_v3"
  ) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
    this.nodeSize = nodeSize;
    this.machineSet = machineSet;
  }
}
