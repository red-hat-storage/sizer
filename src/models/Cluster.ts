import * as _ from "lodash";
import { DeploymentDetails, Platform } from "../types";
import { Service } from "./Service";
import { Workload } from "./Workload";
import { getNewNode, MachineSet } from "./MachineSet";
import { BareMetal, Node } from "./Node";
import { Zone } from "./Zone";
import { generateRandomString } from "./util";

class Cluster {
  machineSets: {
    [machineSetName: string]: MachineSet;
  };
  zones: Zone[];
  platform: Platform;

  constructor(platform: Platform) {
    this.machineSets = {};
    this.zones = [];
    this.platform = platform;

    /*     const odfWorkload = getODFWorkload(
      usableCapacity,
      deploymentType,
      nooBaaActive,
      rgwActive,
      cephFSActive,
      nvmeTuning,
      []
    ); */
  }

  setMachineSetsAndWorkloads(
    machineSets: MachineSet[],
    workloads: Workload[]
  ): void {
    this.machineSets = machineSets.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {} as Cluster["machineSets"]);
    this.zones = [];
    workloads.forEach((wl) => this.addWorkload(wl));
  }

  addZone(nodes: Node[] = []): Zone {
    const zoneIds = this.zones.map((zone) => zone.zoneId);
    let id = "";
    let unique = false;
    while (!unique) {
      id = generateRandomString();
      if (!zoneIds.includes(id)) {
        unique = true;
      }
    }
    const zone = new Zone(nodes, id);
    this.zones.push(zone);
    return zone;
  }

  getSmallestZone(ignoreZones: string[]): Zone {
    const viableZones = this.zones.filter(
      (zone) => !ignoreZones.includes(zone.zoneId)
    );
    if (viableZones.length === 0) {
      return this.addZone();
    }
    return viableZones.reduce((smallestZone, currentZone) => {
      if (
        !smallestZone ||
        currentZone.nodes.length < smallestZone.nodes.length ||
        (currentZone.nodes.length == smallestZone.nodes.length &&
          currentZone.getTotalUsedCPU() < smallestZone.getTotalUsedCPU())
      ) {
        return currentZone;
      }
      return smallestZone;
    }, (null as unknown) as Zone);
  }

  addWorkload(workload: Workload): void {
    for (let i = 0; i < workload.count; i++) {
      // Ensure that the workload name is unambiguous
      this.addServicesOfWorkload(workload, `${workload.name}-${i}`);
    }
  }

  // Private method, only called by addWorkload() which handles the workload count
  private addServicesOfWorkload(
    workload: Workload,
    workloadName: string
  ): void {
    const handledServices: string[] = [];
    Object.entries(workload.services).forEach(([name, service]) => {
      if (!handledServices.includes(name)) {
        // The services in the serviceBundle might have different zones settings
        // We chose to look for the highest zone setting and deploy some services more often than requested
        // So that these services are actually deployed together all the time
        const { serviceBundle, serviceBundleZones } = service.runsWith.reduce(
          ({ serviceBundle, serviceBundleZones }, colocatedServiceName) => {
            const colocatedService = _.find(
              workload.services,
              (s) => s.name === colocatedServiceName
            );
            // We assume that service names are checked when we import the workload
            // Else this could fail when the name is not actually in the service dict
            serviceBundle.push(colocatedService as Service);
            handledServices.push(colocatedServiceName);
            return {
              serviceBundle,
              serviceBundleZones: Math.max(
                serviceBundleZones,
                (colocatedService as Service).zones
              ),
            };
          },
          { serviceBundle: [service], serviceBundleZones: service.zones }
        );
        const usedZones: string[] = [];
        for (let i = 0; i < serviceBundleZones; i++) {
          const zone = this.getSmallestZone(usedZones);
          usedZones.push(zone.zoneId);
          this.addServicesInZone(serviceBundle, workload, workloadName, zone);
        }
      }
    });
  }

  addServicesInZone(
    services: Service[],
    workload: Workload,
    workloadName: string,
    zone: Zone
  ): Node {
    const serviceBundle: Workload = Object.assign({}, workload, { services });
    for (let i = 0; i < zone.nodes.length; i++) {
      const node = zone.nodes[i];
      // if the workload is machineset specific and this node is not of that machineset, skip the node
      if (
        workload?.usesMachines?.length > 0 &&
        !workload?.usesMachines?.includes(node.machineSet)
      ) {
        continue;
      }
      const machineset = this.machineSets[node.machineSet];
      // if the machineset is workload specific and this workload is not mentioned in the machineset, skip the node
      if (
        machineset.onlyFor.length > 0 &&
        !machineset.onlyFor.includes(workload.name)
      ) {
        continue;
      }
      // when we reach this, the node is suitable for this service/workload - now we have to figure out if our services fit on the node
      if (!node.addWorkload(serviceBundle, workloadName)) {
        continue;
      }
      return node;
    }
    // When we reach this, there was no node in this zone that can fit out service/workload combo - so we have to add a node
    // First we try to figure out if the workload wants a specific machineSet
    // If the workload is not specific, we try to find a machineSet that fits our needs
    let newNode = new BareMetal();
    let foundNewNode = false;
    for (let i = 0; i < workload?.usesMachines?.length; i++) {
      const machineset = this.machineSets[workload?.usesMachines[i]];
      newNode = getNewNode(machineset, this.platform);

      if (newNode.addWorkload(serviceBundle, workloadName)) {
        foundNewNode = true;
        break;
      }
    }
    if (!foundNewNode) {
      // Look if there is a machineSet for this workload, then use that
      for (const [, machineSet] of Object.entries(this.machineSets)) {
        if (machineSet.onlyFor.includes(workload.name)) {
          newNode = getNewNode(machineSet, this.platform);

          if (newNode.addWorkload(serviceBundle, workloadName)) {
            foundNewNode = true;
            break;
          }
        }
      }
    }
    if (!foundNewNode) {
      // Use a generic workload to get a new node
      for (const [, machineSet] of Object.entries(this.machineSets)) {
        if (machineSet.onlyFor.length == 0) {
          newNode = getNewNode(machineSet, this.platform);

          if (newNode.addWorkload(serviceBundle, workloadName)) {
            foundNewNode = true;
            break;
          }
        }
      }
    }
    zone.nodes.push(newNode);
    return newNode;
  }

  replaceWorkload(workload: Workload): void {
    this.zones.forEach((zone, zoneIndex) => {
      zone.nodes.forEach((node, nodeIndex) => {
        Object.entries(node.workloads).forEach(
          ([nodeWorkloadName, nodeWorkload]) => {
            // nodeWorkloadName is different to nodeWorkload.name
            // nodeWorkloadName includes the counter variable where
            // nodeWorkload.name is the original name that was supplied by the user
            // By searching for nodeWorkload.name we get all possible workloads that were once created
            // with that original name (via count)
            if (workload.name == nodeWorkload.name) {
              delete node.workloads[nodeWorkloadName];
            }
          }
        );
        // If the node is empty, remove it
        if (Object.keys(node.workloads).length == 0) {
          zone.nodes.splice(nodeIndex, 1);
        }
      });
      if (zone.nodes.length == 0) {
        this.zones.splice(zoneIndex, 1);
      }
    });
    this.addWorkload(workload);
  }

  getDetails(): DeploymentDetails {
    let totalNodes = 0,
      totalCPU = 0,
      totalMem = 0;
    this.zones.forEach((zone) => {
      totalNodes += zone.nodes.length;
      zone.nodes.forEach((node) => {
        totalCPU += node.cpuUnits;
        totalMem += node.memory;
      });
    });
    return {
      ocpNodes: totalNodes,
      cpuUnits: totalCPU,
      memory: totalMem,
      // deploymentType: this.odfDeploymentType,
      // nvmeTuning: this.nvmeTuning,
      // warningFirst: this.targetCapacity * 0.75,
      // warningSecond: this.targetCapacity * 0.85,
      zones: this.zones,
    };
  }
}

export default Cluster;
