import { DeploymentDetails, DeploymentType } from "../types";
import { Service } from "./Service";
import { Workload } from "./Workload";
import { MachineSet } from "./MachineSet";
import Disk from "./Disk";
import { BareMetal, Node } from "./Node";
import { Zone } from "./Zone";
import { generateRandomString } from "./util";

class Cluster {
  diskType: Disk;
  machineSets: {
    [machineSetName: string]: MachineSet;
  };
  zones: Zone[];

  constructor(
    deploymentType: DeploymentType,
    diskType: Disk,
    machineSets: MachineSet[],
    usableCapacity: number,
    cephFSActive = true,
    nooBaaActive = true,
    rgwActive = true,
    nvmeTuning = true,
    workloads: Workload[] = []
  ) {
    this.diskType = diskType;
    this.machineSets = machineSets.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {} as Cluster["machineSets"]);

    this.zones = [];

    const odfWorkload = generateODFWorkload(
      usableCapacity,
      diskType,
      deploymentType,
      nooBaaActive,
      rgwActive,
      cephFSActive,
      nvmeTuning,
      []
    );
    this.addWorkload(odfWorkload);

    workloads.forEach((workload) => {
      this.addWorkload(workload);
    });
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
            const colocatedService = workload.services[colocatedServiceName];
            // We assume that service names are checked when we import the workload
            // Else this could fail when the name is not actually in the service dict
            serviceBundle.push(colocatedService);
            handledServices.push(colocatedServiceName);
            return {
              serviceBundle,
              serviceBundleZones: Math.max(
                serviceBundleZones,
                colocatedService.zones
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
    const serviceBundle = new Workload(
      workload.name,
      services,
      workload.storageCapacityRequired,
      workload.count,
      workload.usesMachines
    );
    for (let i = 0; i < zone.nodes.length; i++) {
      const node = zone.nodes[i];
      // if the workload is machineset specific and this node is not of that machineset, skip the node
      if (
        workload.usesMachines.length > 0 &&
        !workload.usesMachines.includes(node.machineSet)
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
    for (let i = 0; i < workload.usesMachines.length; i++) {
      const machineset = this.machineSets[workload.usesMachines[i]];
      newNode = machineset.getNewNode();

      if (newNode.addWorkload(serviceBundle, workloadName)) {
        foundNewNode = true;
        break;
      }
    }
    if (!foundNewNode) {
      // Look if there is a machineSet for this workload, then use that
      for (const [, machineSet] of Object.entries(this.machineSets)) {
        if (machineSet.onlyFor.includes(workload.name)) {
          newNode = machineSet.getNewNode();

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
          newNode = machineSet.getNewNode();

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
      diskCapacity: this.diskType.capacity,
      // deploymentType: this.odfDeploymentType,
      // nvmeTuning: this.nvmeTuning,
      // warningFirst: this.targetCapacity * 0.75,
      // warningSecond: this.targetCapacity * 0.85,
      zones: this.zones,
    };
  }
}

export const generateODFWorkload = (
  targetCapacity: number,
  diskType: Disk,
  deploymentType: DeploymentType,
  nooBaaActive = true,
  rgwActive = true,
  cephFSActive = true,
  nvmeTuning = false,
  dedicatedMachineSets: string[] = []
): Workload => {
  const odfWorkload = new Workload("ODF", [], 0, 1, dedicatedMachineSets);
  odfWorkload.services["Ceph_MGR"] = new Service(
    "Ceph_MGR", //name
    1, // CPU
    3.5, // Mem
    2, // Zones
    [], // runsWith
    [] //avoids
  );
  odfWorkload.services["Ceph_MON"] = new Service(
    "Ceph_MON", //name
    1, // CPU
    2, // Mem
    3, // Zones
    [], // runsWith
    [] //avoids
  );
  if (rgwActive) {
    let cpu = 2;
    let mem = 4;
    switch (deploymentType) {
      case DeploymentType.EXTERNAL:
        cpu = 8;
        mem = 4;
        break;
      case DeploymentType.MINIMAL:
      case DeploymentType.COMPACT:
        cpu = 1;
        mem = 4;
        break;
    }
    odfWorkload.services["Ceph_RGW"] = new Service(
      "Ceph_RGW", //name
      cpu, // CPU
      mem, // Mem
      2, // Zones
      [], // runsWith
      [] //avoids
    );
  }
  if (cephFSActive) {
    let cpu = 3;
    let mem = 8;
    switch (deploymentType) {
      case DeploymentType.EXTERNAL:
        cpu = 4;
        mem = 8;
        break;
      case DeploymentType.MINIMAL:
      case DeploymentType.COMPACT:
        cpu = 1;
        mem = 8;
        break;
    }
    odfWorkload.services["Ceph_MDS"] = new Service(
      "Ceph_MDS", //name
      cpu, // CPU
      mem, // Mem
      2, // Zones
      [], // runsWith
      [] //avoids
    );
  }
  if (nooBaaActive) {
    odfWorkload.services["NooBaa_DB"] = new Service(
      "NooBaa_DB",
      0.5,
      4,
      2,
      [],
      []
    );
    odfWorkload.services["NooBaa_Endpoint"] = new Service(
      "NooBaa_Endpoint",
      1,
      2,
      2,
      [],
      []
    );
    odfWorkload.services["NooBaa_core"] = new Service(
      "NooBaa_core",
      1,
      4,
      2,
      [],
      []
    );
  }

  const osdsNeededForTargetCapacity = Math.ceil(
    targetCapacity / diskType.capacity
  );

  let osdCPU = 2;
  let osdMem = 5;
  switch (deploymentType) {
    case DeploymentType.EXTERNAL:
      osdCPU = 4;
      osdMem = 5;
      break;
    case DeploymentType.MINIMAL:
    case DeploymentType.COMPACT:
      osdCPU = 1;
      osdMem = 5;
      break;
  }
  if (nvmeTuning) {
    // https://docs.google.com/document/d/1zqckcf4NllPvcKEHBs4wOzReG55P_GwvxdJ-1QajreY/edit#
    osdCPU = 5;
  }
  for (let i = 0; i < osdsNeededForTargetCapacity; i++) {
    odfWorkload.services[`Ceph_OSD_${i}`] = new Service(
      `Ceph_OSD_${i}`, //name
      osdCPU, // CPU
      osdMem, // Mem
      3, // Zones
      [], // runsWith
      [] //avoids
    );
  }

  return odfWorkload;
};

export default Cluster;
