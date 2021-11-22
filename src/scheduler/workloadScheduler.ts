/**
 * Workload Scheduler
 * What it does?
 * 1) Schedules workloads
 * 2) We schedule coplaced services
 * 3) We schedule rest of the services based on the zones
 **/

import { MachineSet, Service, Workload, Zone_ as Zone } from "../models";
import { Node } from "../types";
import * as _ from "lodash";
import { Dispatch } from "@reduxjs/toolkit";
import { addZone, generateZoneID } from "../redux/reducers";
import { getMaxZones } from "../utils/node";
import { addServiceToZone, getCoplacedServices } from "../utils/service";
import { store as Store } from "../redux/store";

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

export const workloadScheduler =
  (store: typeof Store, dispatch: Dispatch) =>
  (workload: Workload, services: Service[], machineSet: MachineSet[]): void => {
    let currentZones: Zone[] = store.getState().zone.zones;
    let currentNodes: Node[] = store.getState().node.nodes;

    const serviceObjects: Service[] = services.filter((service) =>
      workload.services.includes(service.id)
    );

    const maxZonesRequired: number = _.maxBy(
      serviceObjects,
      (service) => service.zones
    ).zones;

    if (maxZonesRequired > currentZones.length) {
      const additionalZonesRequired: number =
        maxZonesRequired - currentZones.length;
      const zoneObjects: Zone[] = createZones(additionalZonesRequired);
      zoneObjects.forEach((z) => dispatch(addZone(z)));
    }

    // Update zones after performing dispatch

    const scheduledServiceIDs: number[] = [];
    serviceObjects.forEach((candidateService) => {
      if (!(candidateService.id in scheduledServiceIDs)) {
        const bundle: Service[] = getCoplacedServices(
          candidateService,
          serviceObjects.filter(
            (service) => !(service.id in scheduledServiceIDs)
          )
        );
        // This service bundle needs to be scheduled
        if (bundle.length > 0) {
          const scheduleInZones: number = getMaxZones(bundle);
          _.times(scheduleInZones, (count) => {
            currentZones = store.getState().zone.zones;
            console.log("Zones", currentZones[count], count);
            currentNodes = store.getState().node.nodes;
            addServiceToZone(dispatch)(
              currentZones[count],
              currentNodes,
              services,
              bundle,
              [workload],
              machineSet
            );
          });
          bundle.forEach((service) => scheduledServiceIDs.push(service.id));
        }
      }
    });
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
