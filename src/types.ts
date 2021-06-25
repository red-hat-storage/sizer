import { Zone } from "./models/Zone";

export type NodeDetails<T> = {
  usedCpuUnits: number;
  usedMemory: number;
  amountOfOSDs: number;
  workloads: {
    [workloadName: string]: T;
  };
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

export type DeploymentDetails = {
  ocpNodes: number;
  cpuUnits: number;
  memory: number;
  diskCapacity?: number;
  // deploymentType: DeploymentType;
  // nvmeTuning: boolean;
  // warningFirst: number;
  // warningSecond: number;
  zones: Zone[];
};
