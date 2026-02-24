/**
 * Workload Scheduler
 * What it does?
 * 1) Schedules workloads
 * 2) We schedule coplaced services
 * 3) We schedule rest of the services based on the zones
 **/

import { MachineSet, Service, Workload, Zone } from "../types";
import { Node } from "../types";
import * as _ from "lodash";
import { getMaxZones, sortBestZones } from "../utils/node";
import { addServiceToZone, getCoplacedServices } from "../utils/service";

// Library version: Simple ID generator (Redux removed)
let zoneIdCounter = 0;
const generateZoneID = () => ++zoneIdCounter;

/**
 * Scheduling logic
 * 1) Zone requirements are met?
 *  - If not add more Zones
 * 2) a)These workloads do they have a affinity to certain MS?
 *  - If so find Nodes that are based on the particular MS
 *  - Check if all the coplaced nodes can fit in the same node ( test existing services are not avoiding the particular set of services)
 *  - If not then workload can't be scheduled.
 *  - If yes place all coplaced in the same node for non coplaced we can create a new node
 *
 *    b) Worklodas don't have affinity
 *     - Find the best zone that fits every thing and place them if not find the most suitable and add more nodes to it.
 *     - If the service is replicated across zones then try to services on each zone and non-replicated on the best fitting zone.
 *
 */

/**
 * Library version: Pure function that returns updated state
 * Schedules a workload across zones and nodes
 */
export const workloadScheduler = (
  workload: Workload,
  services: Service[],
  machineSets: MachineSet[],
  currentZones: Zone[],
  currentNodes: Node[],
  usedZonesId: number[]
): { zones: Zone[]; nodes: Node[] } => {
  let zones = [...currentZones];
  let nodes = [...currentNodes];

  const serviceObjects: Service[] = services.filter((service) =>
    service.id !== undefined && workload.services.includes(service.id)
  );

  const maxZonesRequired: number = _.maxBy(
    serviceObjects,
    (service) => service.zones
  )?.zones || 1;

  if (maxZonesRequired > zones.length) {
    const additionalZonesRequired: number =
      maxZonesRequired - zones.length;
    const zoneObjects: Zone[] = createZones(additionalZonesRequired);
    zones = [...zones, ...zoneObjects];
  }

  const scheduledServiceIDs: number[] = [];
  serviceObjects.forEach((candidateService) => {
    if (candidateService.id !== undefined && !scheduledServiceIDs.includes(candidateService.id)) {
      const bundle: Service[] = getCoplacedServices(
        candidateService,
        serviceObjects.filter(
          (service) => service.id !== undefined && !scheduledServiceIDs.includes(service.id)
        )
      );
      // This service bundle needs to be scheduled
      if (bundle.length > 0) {
        const scheduleInZones: number = getMaxZones(bundle);
        _.times(scheduleInZones, () => {
          const filteredZones = zones.filter(
            (z) => !usedZonesId.includes(z.id)
          );
          const suitableZones = sortBestZones(
            filteredZones,
            nodes,
            services,
            bundle
          );

          let bestZone = suitableZones.pop();
          if (!bestZone) {
            let i = 0;
            while (!bestZone && i < zones.length) {
              if (!usedZonesId.includes(zones[i].id)) {
                bestZone = zones[i];
              }
              i++;
            }
            if (!bestZone) {
              const sortedZones = _.cloneDeep(zones).sort(
                (a, b) => b.id - a.id
              );
              bestZone = sortedZones[0];
              usedZonesId.splice(0, usedZonesId.length);
            }
          }
          if (bestZone) {
            usedZonesId.push(bestZone.id);
          }
          
          // Call addServiceToZone and update state
          const result = addServiceToZone(
            bestZone,
            nodes,
            services,
            bundle,
            [workload],
            machineSets
          );
          nodes = result.nodes;
          const zoneIndex = zones.findIndex(z => z.id === result.zone.id);
          if (zoneIndex !== -1) {
            zones[zoneIndex] = result.zone;
          }
        });
        bundle.forEach((service) => {
          if (service.id !== undefined) {
            scheduledServiceIDs.push(service.id);
          }
        });
      }
    }
  });

  return { zones, nodes };
};

const createZones = (requiredZones: number): Zone[] => {
  const generatedZones: Zone[] = [];
  _.times(requiredZones, () =>
    generatedZones.push({
      id: generateZoneID(),
      nodes: [],
    })
  );
  return generatedZones;
};
