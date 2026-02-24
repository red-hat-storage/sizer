export type Service = {
  id?: number;
  // Name of the Pod
  name: string;
  // required ammount of CPU to run (Resource Requests - used for scheduling)
  requiredCPU: number;
  // required ammount of memory to run (Resource Requests - used for scheduling)
  requiredMemory: number;

  // Resource Limits (actual VM/pod configuration) - Optional for over-commit support
  limitCPU?: number;
  limitMemory?: number;

  // Dynamic over-commit ranges - Optional (for dynamic mode)
  minLimitCPU?: number;
  maxLimitCPU?: number;
  minLimitMemory?: number;
  maxLimitMemory?: number;

  // Over-commit mode - Optional
  overCommitMode?: "static" | "dynamic" | "none";

  // Amount of availability zones that this needs to run in
  zones: number;
  // Coplace this Pod with these other Pods
  runsWith: number[];
  // Avoid placing this Pod on the same node as these Pods
  avoid: number[];
  // Owner of the Service basically a workloadID
  ownerReference?: number;
};

export type ServiceDescriptor = Omit<Service, "avoid" | "runsWith"> & {
  // Coplace this Pod with these other Pods
  runsWith: string[];
  // Avoid placing this Pod on the same node as these Pods
  avoid: string[];
};
