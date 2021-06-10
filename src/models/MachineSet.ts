import { Platform } from "../types";
import {
  Node,
  BareMetal,
  AWSattached,
  AWSEBS,
  Azure,
  GCP,
  VMnode,
} from "./Node";

export class MachineSet {
  // Name of machinesets
  name: string;
  // Number of CPU units per node of this set
  cpu: number;
  // Number of memory in GB per node of this set
  memory: number;
  // The platform that is used for the nodes
  platform: Platform;
  // The size of the nodes, use this for public cloud instance types
  nodeSize: string;
  // Number of usable disks per node of this set
  // Default is 24
  numberOfDisks: number;
  // Only use this set for this particular workload
  // Default is to be used by any workload
  onlyFor: string[];

  constructor(
    name: string,
    cpu: number,
    memory: number,
    platform: Platform,
    nodeSize: string,
    numberOfDisks: number,
    onlyFor: string[]
  ) {
    this.name = name;
    this.cpu = cpu;
    this.memory = memory;
    this.platform = platform;
    this.nodeSize = nodeSize;
    this.numberOfDisks = numberOfDisks;
    this.onlyFor = onlyFor;
  }

  getNewNode(): Node {
    switch (this.platform) {
      case Platform.BAREMETAL:
        return new BareMetal(
          this.numberOfDisks,
          this.cpu,
          this.memory,
          this.name
        );
      case Platform.AWSi3:
        return new AWSattached(
          this.numberOfDisks,
          this.cpu,
          this.memory,
          this.name
        );
      case Platform.AWSm5:
        return new AWSEBS(this.numberOfDisks, this.cpu, this.memory, this.name);
      case Platform.GCP:
        return new GCP(this.numberOfDisks, this.cpu, this.memory, this.name);
      case Platform.AZURE:
        return new Azure(this.numberOfDisks, this.cpu, this.memory, this.name);
      case Platform.VMware:
      case Platform.RHV:
        return new VMnode(this.numberOfDisks, this.cpu, this.memory, this.name);
    }
  }
}
