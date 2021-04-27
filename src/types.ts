import ReplicaSet from "./models/ReplicaSet";

export type NodeDetails<T> = {
  usedCpuUnits: number;
  usedMemory: number;
  amountOfOSDs: number;
  services: Array<T>;
};

export const enum Platform {
  BAREMETAL = "BareMetal",
  AWSi3 = "AWSi3",
  AWSm5 = "AWSm5",
  GCP = "GCP",
  AZURE = "AZURE",
  VMware = "VMware",
  RHV = "RHV",
}

export const enum DeploymentType {
  INTERNAL = "internal",
  EXTERNAL = "external",
  COMPACT = "compact",
  MINIMAL = "minimal",
}

export type State = {
  platform: Platform;
  nodeCPU: number;
  nodeMemory: number;
  flashSize: number;
  usableCapacity: number;
  deploymentType: DeploymentType;
  nvmeTuning: boolean;
  cephFSActive: boolean;
  nooBaaActive: boolean;
  rgwActive: boolean;
};

export enum Action {
  setPlatform = "setPlatform",
  setNodeCPU = "setNodeCPU",
  setNodeMemory = "setNodeMemory",
  setFlashSize = "setFlashSize",
  setUsableCapacity = "setUsableCapacity",
  setDeploymentType = "setDeploymentType",
  setNVMeTuning = "setNVMeTuning",
  setCephFSActive = "setCephFSActive",
  setNooBaaActive = "setNooBaaActive",
  setRGWActive = "setRGWActive",
}

export type Payload = State[keyof State];

export type DeploymentDetails = {
  ocpNodes: number;
  cpuUnits: number;
  memory: number;
  capacity: number;
  deploymentType: DeploymentType;
  nvmeTuning: boolean;
  warningFirst: number;
  warningSecond: number;
  replicaSets: ReplicaSet[];
};
