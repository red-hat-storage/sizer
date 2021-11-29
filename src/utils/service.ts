import { MachineSet, Service, Workload, Zone } from "../types";
import { Node } from "../types";
import { canNodeAddService, getTotalNodeMemoryConsumption } from "./node";
import { Dispatch } from "@reduxjs/toolkit";
import {
  addNode,
  addNodesToZone,
  addServicesToNode,
  getNodeID,
} from "../redux/reducers";
import { getMachineSetForWorkload } from "./workload";
import { getTotalResourceRequirement } from "./common";

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
  workloads: Workload[]
): Node[] => {
  const viableNodes = nodes.filter((node) =>
    candidateServices.every((candidate) =>
      canNodeAddService(node, candidate, services, workloads)
    )
  );
  const sortedViableNodes = viableNodes.sort(
    (a, b) =>
      getTotalNodeMemoryConsumption(a, services) -
      getTotalNodeMemoryConsumption(b, services)
  );
  return sortedViableNodes;
};

const getNode = (machineSet: MachineSet): Node => ({
  id: getNodeID(),
  maxDisks: machineSet.numberOfDisks,
  cpuUnits: machineSet.cpu,
  memory: machineSet.memory,
  machineSet: machineSet.name,
  services: [],
});

/**
 *
 * @param zone The zone where we want to add the service
 * @param nodes All the node objects
 * @param services All the service objects
 * @param candidateServices Array of services that are to be added, (array means they need to be coplaced)
 */
export const addServiceToZone =
  (dispatch: Dispatch) =>
  (
    zone: Zone,
    nodes: Node[],
    services: Service[],
    candidateServices: Service[],
    workloads: Workload[],
    machineSets: MachineSet[]
  ): void => {
    // Nodes in a particular zone
    const nodesInZone: Node[] = nodes.filter((node) =>
      zone.nodes.includes(node.id)
    );
    const sortedViableNodes = sortNodesWithLeastConsumption(
      nodesInZone,
      services,
      candidateServices,
      workloads
    );

    if (sortedViableNodes.length > 0) {
      // Easy peasy add the service to top most node
      const nodeToRun = sortedViableNodes[0];
      const servicesToAdd = candidateServices.map((service) => service.id);
      dispatch(
        addServicesToNode({
          nodeID: nodeToRun.id,
          services: servicesToAdd as number[],
        })
      );
    } else {
      // Add one more node to the zone
      // Check if it requires node of a particular type; Taking 0th service as coplaced services are always of the same workload
      const workload: Workload = workloads.find((wl) =>
        wl.services.includes(candidateServices[0].id as number)
      ) as Workload;
      const node: Node = getNode(
        getMachineSetForWorkload(workload, machineSets)
      );
      // Add node to the store
      dispatch(addNode(node));
      dispatch(
        addServicesToNode({
          nodeID: node.id,
          services: candidateServices.map((service) => service.id) as number[],
        })
      );
      dispatch(addNodesToZone({ zoneId: zone.id as number, nodes: [node.id] }));
    }
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
    if (!scheduledIDs.includes(service.id)) {
      const coRunners: Service[] = [
        service,
        ...service.runsWith.map((id) =>
          services.find((service) => service.id === id)
        ),
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
