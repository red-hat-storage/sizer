export type Service = {
  id?: number;
  // Name of the Pod
  name: string;
  // required ammount of CPU to run
  requiredCPU: number;
  // required ammount of memory to run
  requiredMemory: number;
  // Amount of availability zones that this needs to run in
  zones: number;
  // Coplace this Pod with these other Pods
  runsWith: number[];
  // Avoid placing this Pod on the same node as these Pods
  avoid: number[];
  // Owner of the Service basically a workloadID
  ownerReference?: number;
};
