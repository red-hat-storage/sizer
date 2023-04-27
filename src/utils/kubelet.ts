/**
 * https://learnk8s.io/allocatable-resources#:~:text=The%20memory%20reserved%20for%20the%20Kubelet%20is%3A,of%20memory%20(up%20to%208GB)
 * 
255 MiB of memory for machines with less than 1 GB of memory
25% of the first 4GB of memory
20% of the next 4GB of memory (up to 8GB)
10% of the next 8GB of memory (up to 16GB)
6% of the next 112GB of memory (up to 128GB)
2% of any memory above 128GB
For CPU resources, GKE reserves the following:

6% of the first core
1% of the next core (up to 2 cores)
0.5% of the next 2 cores (up to 4 cores)
0.25% of any cores above 4 cores
 * 
 */

export const getNodeKubeletMemoryRequirements = (
  nodeMemory: number
): number => {
  if (nodeMemory < 1) {
    return 0.255;
  }
  let memoryUsage = 0;
  if (nodeMemory > 1) {
    memoryUsage += 0.25 * (nodeMemory <= 4 ? nodeMemory - 1 : 4);
  }
  if (nodeMemory > 4) {
    memoryUsage += 0.2 * (nodeMemory <= 8 ? nodeMemory - 4 : 4);
  }
  if (nodeMemory > 8) {
    memoryUsage += 0.1 * (nodeMemory <= 16 ? nodeMemory - 8 : 8);
  }
  if (nodeMemory > 16) {
    memoryUsage += 0.06 * (nodeMemory <= 128 ? nodeMemory - 16 : 112);
  }
  if (nodeMemory > 128) {
    memoryUsage += (nodeMemory - 128) * 0.02;
  }
  return memoryUsage;
};

export const getNodeKubeletCPURequirements = (nodeCPU: number): number => {
  let cpuUsage = 0.06;
  if (nodeCPU > 1) {
    cpuUsage += 0.01 * (nodeCPU <= 2 ? nodeCPU - 1 : 1);
  }
  if (nodeCPU > 2) {
    cpuUsage += 0.005 * (nodeCPU <= 4 ? nodeCPU - 2 : 2);
  }
  if (nodeCPU > 4) {
    cpuUsage += 0.0025 * (nodeCPU - 4);
  }
  return cpuUsage;
};
