import { Service, Workload, Zone, MachineSet } from "../types";
import { Node } from "../types";
import * as _ from "lodash";
import {
  canNodeSupportRequirements,
  getTotalResourceRequirement,
} from "./common";

/**
 *
 * @param node The node where the service needs to be added
 * @param candidate Service we want to add to this node
 * @param allServices All the service objects (required as Node only tracks the service)
 * @returns
 */
// Helper function to identify control plane services
const isControlPlaneService = (service: Service): boolean => {
  const controlPlaneServiceNames = [
    "kube-apiserver",
    "etcd",
    "kube-controller-manager",
    "kube-scheduler",
    "cluster-version-operator",
    "control-plane",
    "controlplane", // Match "ControlPlane" service
  ];
  return controlPlaneServiceNames.some((name) =>
    service.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const canNodeAddService = (
  node: Node,
  candidate: Service,
  allServices: Service[],
  workloads: Workload[],
  machineSets: MachineSet[]
): boolean => {
  // If service has no ID, can't schedule
  if (candidate.id === undefined) {
    return false;
  }

  const candidateId = candidate.id;
  const currentWorkload = workloads.find((workload) =>
    workload.services.includes(candidateId)
  );

  // If no workload found, can't schedule
  if (!currentWorkload) {
    return false;
  }

  // Check if the workload is meant to run on a particular node
  if (
    !_.isEmpty(currentWorkload.usesMachines) &&
    !currentWorkload.usesMachines.includes(node.machineSet)
  ) {
    return false;
  }

  // Look up the machine set for this node
  const machineSet = machineSets.find((ms) => ms.name === node.machineSet);

  // Control plane scheduling rules
  if (node.isControlPlane) {
    // Control plane services can always be scheduled on control plane nodes
    if (isControlPlaneService(candidate)) {
      return true;
    }
    // For non-control plane services, check scheduling permissions
    // Check both the node property and the MachineSet property
    if (!node.allowWorkloadScheduling && !machineSet?.allowWorkloadScheduling) {
      return false;
    }
  } else {
    // Non-control plane node - check if workload requires control plane
    if (currentWorkload?.requireControlPlane) {
      return false; // Workload requires control plane but this isn't one
    }
  }

  // Check if node is tainted, but skip this check for schedulable control plane nodes
  const isSchedulableControlPlane =
    machineSet?.name === "controlPlane" &&
    machineSet?.allowWorkloadScheduling === true;

  if (
    !isSchedulableControlPlane &&
    !_.isEmpty(node.onlyFor) &&
    !node.onlyFor.includes(currentWorkload.name)
  ) {
    return false;
  }

  const { services: existingServicesIds }: Node = node;
  // Get all the service objects from the ids
  const existingServices = allServices.filter((service) =>
    service.id !== undefined && existingServicesIds.includes(service.id)
  );

  // Does the candidate avoid any of the preexisting service
  if (_.intersection(candidate.avoid, existingServicesIds).length > 0) {
    return false;
  }

  // Does the avoid of any of the existing services contain the candiate
  const existingAvoids = _.flatten(
    existingServices.map((service) => service.avoid)
  );
  if (_.intersection([candidate.id], existingAvoids).length > 0) {
    return false;
  }

  // Resource Calculation
  // Check if the node can handle resource requirements
  const nodeResourceConsumption = getTotalResourceRequirement(existingServices);

  // Important: Scheduler should always schedule coplaced services together
  const coplacedServices = allServices.filter((service) =>
    service.id !== undefined && candidate.runsWith.includes(service.id)
  );
  const adjustedCandidates = [...coplacedServices, candidate];

  const candidateResourceRequirement =
    getTotalResourceRequirement(adjustedCandidates);
  const canSupport = canNodeSupportRequirements(
    candidateResourceRequirement,
    nodeResourceConsumption,
    node
  );

  return canSupport;
};

export const getTotalNodeMemoryConsumption = (
  node: Node,
  services: Service[]
): number => {
  const nodeServices = getServicesInNode(node, services);
  return getTotalResourceRequirement(nodeServices).totalMem;
};

// export const getMachineSetNodes = (machineSet: string, nodes: Node[]): Node[] =>
//   nodes.filter((node) => machineSet === node.machineSet);

// export const getSuitableNodesFor = (
//   workload: Workload,
//   nodes: Node[],
//   machineSets: MachineSet[]
// ): Node[] => {
//   const usableMS = machineSets.filter((ms) =>
//     ms.onlyFor.length > 0 ? ms.onlyFor.includes(workload.name) : true
//   );
//   return _.flatten(usableMS.map((ms) => getMachineSetNodes(ms.name, nodes)));
// };

// const getNodeOfMachineSet = (machineset: MachineSet): Node => ({
//   id: getNodeID(),
//   maxDisks: machineset.numberOfDisks,
//   cpuUnits: machineset.cpu,
//   memory: machineset.memory,
//   machineSet: machineset.name,
//   services: [],
// });

// export const getNodeForWorkload = (
//   workload: Workload,
//   machineSet: MachineSet[]
// ): Node => {
//   const dedicatedMS = workload.usesMachines;
//   const candidateMS =
//     dedicatedMS.length > 0
//       ? machineSet.filter((ms) => dedicatedMS.includes(ms.name))
//       : machineSet.filter((ms) => ms.name === "default");
//   const usingMS = candidateMS[0];
//   return getNodeOfMachineSet(usingMS);
// };

export const getMaxZones = (services: Service[]): number =>
  _.max(services.map((service) => service.zones)) || 1;

export const getServicesInNode = (node: Node, services: Service[]): Service[] =>
  services.filter((service) => service.id !== undefined && node.services.includes(service.id));

export const getOSDsInNode = (node: Node, services: Service[]): number => {
  const nodeServices = getServicesInNode(node, services);
  return nodeServices.filter((service) =>
    service.name.toUpperCase().includes("OSD")
  ).length;
};

export const sortBestZones = (
  zones: Zone[],
  nodes: Node[],
  allServices: Service[],
  workload: Service[]
): Zone[] => {
  const requirements = getTotalResourceRequirement(workload);

  const suitableZones: Array<{ zone: Zone; freeNodes: number }> = [];

  zones.forEach((zone) => {
    const nodesInZone = nodes.filter((node) => zone.nodes.includes(node.id));
    const nodesThatCanSupport = nodesInZone.filter((node) => {
      const servicesInNode = allServices.filter((s) =>
        s.id !== undefined && node.services.includes(s.id)
      );
      const currentNodeUsage = getTotalResourceRequirement(servicesInNode);
      return canNodeSupportRequirements(requirements, currentNodeUsage, node);
    });
    if (nodesThatCanSupport.length > 0) {
      suitableZones.push({ zone, freeNodes: nodesThatCanSupport.length });
    }
  });

  suitableZones.sort((a, b) => {
    const diff = b.freeNodes - a.freeNodes;
    if (diff === 0) {
      return b.zone.id - a.zone.id;
    }
    return diff;
  });
  return suitableZones.map((sZ) => sZ.zone);
};
