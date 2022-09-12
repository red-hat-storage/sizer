import { Platform, Service } from "../types";
import { Node } from "../types";

type ResourceRequirement = {
  totalMem: number;
  totalCPU: number;
  totalDisks: number;
};

export const getTotalResourceRequirement = (
  services: Service[],
  multiplyByZone?: boolean
): ResourceRequirement => {
  return services.reduce(
    (acc, service) => {
      if (service.name.includes("Ceph_OSD")) {
        acc.totalDisks += 1;
      }
      acc.totalMem += multiplyByZone
        ? service.requiredMemory * service.zones
        : service.requiredMemory;
      acc.totalCPU += multiplyByZone
        ? service.requiredCPU * service.zones
        : service.requiredCPU;
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
  requirements.totalMem + currentUsage.totalMem > node.memory ||
  requirements.totalDisks + currentUsage.totalDisks > node.maxDisks
    ? false
    : true;

export const isCloudPlatform = (platform: Platform): boolean =>
  [Platform.AWS, Platform.AZURE, Platform.GCP, Platform.IBM].includes(platform);
