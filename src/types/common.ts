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
  GCP = "GCP",
  AZURE = "AZURE",
  VMware = "VMware",
  RHV = "RHV",
  AWS = "AWS",
  IBM = "IBM",
}

export const enum DeploymentType {
  INTERNAL = "internal",
  EXTERNAL = "external",
  COMPACT = "compact",
  MINIMAL = "minimal",
}

export type Instance = {
  // Human friendly name of this instance type
  // the way it is known on this platform
  // e.g. m5.4xlarge
  name: string;
  // Memory of this instance type in GB
  memory: number;
  //  CPU Units (threads) of this instance type
  cpuUnits: number;
  // Zero if no local disks available
  // Else the TB of one of the local disks
  instanceStorage?: number;
  // Storage Type (SSD/HDD)
  storageType?: string;
  // Number of local disks in this instance
  maxDisks?: number;
  // True if this is the default worker type
  // on this platform
  default?: boolean;
  // True if this is the default control plane
  // type on this platform
  controlPlane?: boolean;
  // True if this is the default ODF
  // type on this platform
  odfDefault?: boolean;
};
