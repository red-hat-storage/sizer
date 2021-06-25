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

export type MachineSet = {
  name: string;
  // Number of CPU units per node of this set
  cpu: number;
  // Number of memory in GB per node of this set
  memory: number;
  // The size of the nodes, use this for public cloud instance types
  nodeSize: string;
  // Number of usable disks per node of this set
  // Default is 24
  numberOfDisks: number;
  // Only use this set for this particular workload
  // Default is to be used by any workload
  onlyFor: string[];
};

export const getNewNode = (
  machineSet: MachineSet,
  platform: Platform
): Node => {
  switch (platform) {
    case Platform.BAREMETAL:
      return new BareMetal(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
    case Platform.AWSi3:
      return new AWSattached(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
    case Platform.AWSm5:
      return new AWSEBS(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
    case Platform.GCP:
      return new GCP(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
    case Platform.AZURE:
      return new Azure(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
    case Platform.VMware:
    case Platform.RHV:
      return new VMnode(
        machineSet.numberOfDisks,
        machineSet.cpu,
        machineSet.memory,
        machineSet.name
      );
  }
};
