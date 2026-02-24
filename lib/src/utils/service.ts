import { MachineSet, Service, Workload, Zone } from "../types";
import { Node } from "../types";
import { canNodeAddService, getTotalNodeMemoryConsumption } from "./node";
import { getTotalResourceRequirement } from "./common";

// Redux-dependent functions have been removed from library version
// The scheduler will be refactored to work without Redux

export const getMachineSetForWorkload = (
  workload: Workload,
  machineSets: MachineSet[]
): MachineSet => {
  const dedicatedMS = machineSets.find((ms) =>
    (ms.onlyFor || []).includes(workload.name)
  );
  if (dedicatedMS) {
    return dedicatedMS;
  }
  if (workload.usesMachines.length > 0) {
    return machineSets.find((ms) =>
      workload.usesMachines.includes(ms.name)
    ) as MachineSet;
  }
  
  // When no specific machineset is requested, prefer non-control-plane machinesets
  // This ensures workloads default to worker nodes when usesMachines is empty
  const defaultMS = machineSets.find(ms => 
    ms.name !== 'controlPlane' && ms.name !== 'control-plane'
  );
  
  if (defaultMS) {
    return defaultMS;
  }
  
  // Fallback to first machineset if no worker found
  return machineSets[0];
};

/**
 *
 * @param service candidate service which we want to test
 * @param zones zones that are currently active
 * @returns Number of zones required
 */
export const getRequiredZones = (service: Service, zones: Zone[]): number => {
  if (zones.length < service.zones) {
    return service.zones - zones.length;
  }
  return 0;
};

export const sortNodesWithLeastConsumption = (
  nodes: Node[],
  services: Service[],
  candidateServices: Service[],
  workloads: Workload[],
  machineSets: MachineSet[]
): Node[] => {
  const viableNodes = nodes.filter((node) =>
    candidateServices.every((candidate) =>
      canNodeAddService(node, candidate, services, workloads, machineSets)
    )
  );
  const sortedViableNodes = viableNodes.sort(
    (a, b) =>
      getTotalNodeMemoryConsumption(a, services) -
      getTotalNodeMemoryConsumption(b, services)
  );
  return sortedViableNodes;
};

// Library version: Simple ID generation (Redux removed)
let nodeIdCounter = 0;

const getNode = (machineSet: MachineSet): Node => ({
  id: ++nodeIdCounter,
  maxDisks: machineSet?.numberOfDisks,
  cpuUnits: machineSet.cpu,
  memory: machineSet.memory,
  machineSet: machineSet.name,
  services: [],
  instanceName: machineSet.instanceName,
  onlyFor: machineSet.onlyFor,
  // Set control plane properties based on machine set configuration
  isControlPlane: machineSet.name === "controlPlane",
  allowWorkloadScheduling:
    machineSet.allowWorkloadScheduling ??
    (machineSet.name === "controlPlane" ? false : undefined),
  controlPlaneReserved:
    machineSet.controlPlaneReserved ??
    (machineSet.name === "controlPlane"
      ? {
          cpu: 2, // Default: Reserve 2 CPU for control plane services
          memory: 4, // Default: Reserve 4GB for control plane services
        }
      : undefined),
});

/**
 * LIBRARY VERSION: This function has been refactored to not use Redux
 * It now returns the updated state instead of dispatching actions
 * 
 * @param zone The zone where we want to add the service
 * @param nodes All the node objects
 * @param services All the service objects
 * @param candidateServices Array of services that are to be added, (array means they need to be coplaced)
 * @returns Updated nodes and zone
 */
export const addServiceToZone = (
  zone: Zone,
  nodes: Node[],
  services: Service[],
  candidateServices: Service[],
  workloads: Workload[],
  machineSets: MachineSet[]
): { nodes: Node[]; zone: Zone } => {
    // Nodes in a particular zone
    const nodesInZone: Node[] = nodes.filter((node) =>
      zone.nodes.includes(node.id)
    );
    const sortedViableNodes = sortNodesWithLeastConsumption(
      nodesInZone,
      services,
      candidateServices,
      workloads,
      machineSets
    );

  const updatedNodes = [...nodes];
  const updatedZone = { ...zone };

  if (sortedViableNodes.length > 0) {
    // Add services to existing node
    const nodeToRun = sortedViableNodes[0];
    const servicesToAdd = candidateServices.map((service) => service.id).filter((id): id is number => id !== undefined);
    
    const nodeIndex = updatedNodes.findIndex(n => n.id === nodeToRun.id);
    if (nodeIndex !== -1) {
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        services: [...updatedNodes[nodeIndex].services, ...servicesToAdd]
      };
    }
  } else {
    // Create new node and add to zone
    const workload = workloads.find((wl) =>
      wl.services.includes(candidateServices[0].id as number)
    );
    
    if (!workload) {
      return { nodes: updatedNodes, zone: updatedZone };
    }

    const node: Node = getNode(getMachineSetForWorkload(workload, machineSets));
    node.services = candidateServices.map((service) => service.id).filter((id): id is number => id !== undefined);
    
    updatedNodes.push(node);
    updatedZone.nodes = [...updatedZone.nodes, node.id];
  }

  return { nodes: updatedNodes, zone: updatedZone };
};

/**
 *
 * @param services Services we want to segregate to coplaced.
 */
export const getCoplacedServices = (
  candidateService: Service,
  services: Service[]
): Service[] => {
  const coplacedServices: Service[] = [candidateService];
  services.forEach((service) => {
    if (
      candidateService.runsWith.includes(service.id as number) &&
      service.id !== candidateService.id
    ) {
      coplacedServices.push(service);
    }
  });
  return coplacedServices;
};

export const getAvoidedServiceIds = (services: Service[]): number[] =>
  services.reduce<number[]>((acc, curr) => {
    const { avoid } = curr;
    acc = [...acc, ...avoid];
    return acc;
  }, []);

export const getAllCoplacedServices = (services: Service[]): Service[][] => {
  const scheduledIDs: number[] = [];
  const coplacedServices: Service[][] = [];
  services.forEach((service) => {
    if (service.id !== undefined && !scheduledIDs.includes(service.id)) {
      const coRunners: Service[] = [
        service,
        ...service.runsWith
          .map((id) => services.find((s) => s.id === id))
          .filter((s): s is Service => s !== undefined),
      ];
      scheduledIDs.push(service.id);
      service.runsWith.forEach((id) => scheduledIDs.push(id));
      coplacedServices.push(coRunners);
    }
  });
  return coplacedServices;
};

export const sortServices = (
  serviceA: Service[],
  serviceB: Service[]
): number => {
  const { totalMem: memA, totalCPU: cpuA } =
    getTotalResourceRequirement(serviceA);
  const { totalMem: memB, totalCPU: cpuB } =
    getTotalResourceRequirement(serviceB);
  return memB + cpuB - (memA + cpuA);
};
