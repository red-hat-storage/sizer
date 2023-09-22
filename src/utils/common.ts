import { Instance, MachineSet, Platform, Service } from "../types";
import { Node } from "../types";
import {
  getNodeKubeletCPURequirements,
  getNodeKubeletMemoryRequirements,
} from "./kubelet";

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
): boolean => {
  const kubeletCPU = getNodeKubeletCPURequirements(node.cpuUnits);
  const kubeletMemory = getNodeKubeletMemoryRequirements(node.memory);

  return requirements.totalCPU + currentUsage.totalCPU + kubeletCPU >
    node.cpuUnits ||
    requirements.totalMem + currentUsage.totalMem + kubeletMemory >
      node.memory ||
    requirements.totalDisks + currentUsage.totalDisks > node.maxDisks
    ? false
    : true;
};
export const isCloudPlatform = (platform: Platform): boolean =>
  [
    Platform.AWS,
    Platform.AZURE,
    Platform.GCP,
    Platform.IBMC,
    Platform.IBMV,
  ].includes(platform);

export const getMachinetSetFromInstance = (
  instance: Instance,
  id: number,
  name: string,
  label: string,
  onlyFor: string[] = [],
  maxDisks?: number
): MachineSet => {
  return {
    id,
    name,
    cpu: instance.cpuUnits,
    memory: instance.memory,
    instanceName: instance.name,
    numberOfDisks: maxDisks ?? instance.maxDisks,
    onlyFor,
    label,
  };
};