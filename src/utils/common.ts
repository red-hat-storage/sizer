import { Service } from "../types";
import { Node } from "../types";

type ResourceRequirement = {
  totalMem: number;
  totalCPU: number;
  totalDisks: number;
};

export const getTotalResourceRequirement = (
  services: Service[]
): ResourceRequirement => {
  return services.reduce(
    (acc, service) => {
      if (service.name.includes("Ceph_OSD")) {
        acc.totalDisks += 1;
      }
      acc.totalMem += service.requiredMemory;
      acc.totalCPU += service.requiredCPU;
      return acc;
    },
    { totalMem: 0, totalCPU: 0, totalDisks: 0 }
  );
};

export const canNodeSupportRequirements = (
  requirements: ResourceRequirement,
  currentUsage: ResourceRequirement,
  node: Node
): boolean =>
  requirements.totalCPU + currentUsage.totalCPU > node.cpuUnits ||
  requirements.totalMem + currentUsage.totalMem > node.memory
    ? false
    : true;
