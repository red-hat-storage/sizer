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
  IBMC = "IBM-Classic",
  IBMV = "IBM-VPC",
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

// Over-commit range type for dynamic limits
export type ResourceRange = {
  min: number;
  max: number;
};

// Over-commit metrics for a single node
export type NodeOverCommitMetrics = {
  requestedCPU: number; // Total CPU requests
  requestedMemory: number; // Total memory requests (GB)
  limitCPU: number | ResourceRange; // Total CPU limits (number for static, range for dynamic)
  limitMemory: number | ResourceRange; // Total memory limits (number for static, range for dynamic)
  cpuOverCommitRatio: number | ResourceRange; // limitCPU / availableCPU (after Kubelet)
  memoryOverCommitRatio: number | ResourceRange; // limitMemory / availableMemory (after Kubelet)
  riskLevel: "none" | "low" | "medium" | "high"; // Based on worst-case (max) over-commit ratio
};

// Over-commit metrics for the entire cluster
export type ClusterOverCommitMetrics = {
  totalRequests: {
    cpu: number;
    memory: number;
  };
  totalLimits: {
    cpu: number | ResourceRange; // Total limits (number for all-static, range if any dynamic)
    memory: number | ResourceRange;
  };
  totalAllocatable: {
    cpu: number; // After Kubelet
    memory: number; // After Kubelet
  };
  overCommitRatio: {
    cpu: number | ResourceRange; // totalLimits.cpu / totalAllocatable.cpu
    memory: number | ResourceRange; // totalLimits.memory / totalAllocatable.memory
  };
  riskLevel: "none" | "low" | "medium" | "high"; // Based on worst-case (max)
};
