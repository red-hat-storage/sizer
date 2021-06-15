import { DeploymentDetails, DeploymentType } from "../types";
import { Service } from "./Service";
import { Workload } from "./Workload";
import { MachineSet } from "./MachineSet";
import Disk from "./Disk";
import { BareMetal, Node } from "./Node";
import { Zone } from "./Zone";

class Cluster {
  diskType: Disk;
  machineSets: Record<string, MachineSet>;
  zones: Zone[];

  constructor(
    deploymentType: DeploymentType,
    diskType: Disk,
    machineSets: Record<string, MachineSet>,
    usableCapacity: number,
    cephFSActive = true,
    nooBaaActive = true,
    rgwActive = true,
    nvmeTuning = true,
    workloads: Workload[] = []
  ) {
    this.diskType = diskType;
    this.machineSets = machineSets;
    this.zones = [];

    const odfWorkload = this.getODFWorkload(
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

  getSmallestZone(ignoreZones: number[]): number {
    let smallestZone = -1;
    let smallestZoneCPU = 0;
    for (let i = 0; i < this.zones.length; i++) {
      if (ignoreZones.includes(i)) {
        continue;
      }
      const zone = this.zones[i];
      const currentZoneCPU = zone.getTotalUsedCPU();
      if (
        smallestZone == -1 ||
        zone.nodes.length < this.zones[smallestZone].nodes.length
        //  ||
        // (zone.nodes.length == this.zones[smallestZone].nodes.length &&
        //   currentZoneCPU < smallestZoneCPU)
      ) {
        smallestZone = i;
        smallestZoneCPU = currentZoneCPU;
      }
    }
    if (smallestZone == -1) {
      // We reach this if all zones are in the ignore list
      // then we just add a zone to our zone list
      return this.zones.push(new Zone([])) - 1;
    }
    return smallestZone;
  }

  addWorkload(workload: Workload): void {
    for (let i = 0; i < workload.count; i++) {
      // Ensure that the workload name is unambiguous
      workload.name += `-${i}`;
      this.addServicesOfWorkload(workload);
    }
  }

  // Private method, only called by addWorkload() which handles the workload count
  private addServicesOfWorkload(workload: Workload): void {
    const handledServices: string[] = [];

    for (const [name, service] of Object.entries(workload.services)) {
      if (handledServices.includes(name)) {
        continue;
      }
      const serviceBundle = [];
      serviceBundle.push(service);
      // The services in the serviceBundle might have different zones settings
      // We chose to look for the highest zone setting and deploy some services more often than requested
      // So that these services are actually deployed together all the time
      let bundleZones = service.zones;
      for (let i = 0; i < service.runsWith.length; i++) {
        const colocatedServiceName = service.runsWith[i];
        const colocatedService = workload.services[colocatedServiceName];
        // We assume that service names are checked when we import the workload
        // Else this could fail when the name is not actually in the service dict
        serviceBundle.push(colocatedService);
        handledServices.push(colocatedServiceName);
        bundleZones = Math.max(bundleZones, colocatedService.zones);
      }
      const usedZones: number[] = [];
      for (let i = 0; i < bundleZones; i++) {
        const zoneIndex = this.getSmallestZone(usedZones);
        usedZones.push(zoneIndex);
        this.addServicesInZone(serviceBundle, workload, this.zones[zoneIndex]);
      }
    }
  }

  addServicesInZone(services: Service[], workload: Workload, zone: Zone): Node {
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
      if (!node.addWorkload(serviceBundle)) {
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

      if (newNode.addWorkload(serviceBundle)) {
        foundNewNode = true;
        break;
      }
    }
    if (!foundNewNode) {
      // Look if there is a machineSet for this workload, then use that
      for (const [, machineSet] of Object.entries(this.machineSets)) {
        if (machineSet.onlyFor.includes(workload.name)) {
          newNode = machineSet.getNewNode();

          if (newNode.addWorkload(serviceBundle)) {
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

          if (newNode.addWorkload(serviceBundle)) {
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
    this.zones.forEach((zone) => {
      zone.nodes.forEach((node) => {
        if (workload.name in node.workloads) {
          delete node.workloads[workload.name];
        }
      });
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

  // Todo: Take it to the new world!
  printSKU(): string {
    let totalSKUCores = 0,
      totalCores = 0,
      totalMemory = 0,
      totalDisks = 0;
    this.zones.forEach((zone) => {
      zone.nodes.forEach((node) => {
        // SKUs cannot be shared between nodes
        // Thus we need to round up to the next round number
        totalCores += node.getUsedCPU();
        totalSKUCores += node.cpuUnits;
        totalMemory += node.getUsedMemory();
        totalDisks += node.getAmountOfOSDs();
      });
    });
    let message =
      "<div>" +
      `<div>Based on your input, ODF will require a total of ${totalCores} <button class="cpuUnitTooltip">CPU Units</button>, ${totalMemory} GB RAM and ${totalDisks} flash disks</div>`;
    message += `<div>For the Red Hat SKU calculation we need to use the total instance CPU Unit count of ${totalSKUCores} <button class="cpuUnitTooltip">CPU Units</button></div>`;

    if (totalSKUCores <= 48) {
      message += `<div class="pt-2">This cluster is small enough to qualify for a StarterPack SKU!</div>`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).redhatter as boolean) {
        message += `<div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00213#product-attributes" target="_blank" >Standard SKU version - RS00213</a></div>
      <div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00212#product-attributes" target="_blank" >Premium SKU version - RS00212</a></div>`;
      }
    } else {
      let showTwoThreads = true;
      if (totalSKUCores <= 96) {
        message += `<div class="pt-2">This cluster is small enough to qualify for a StarterPack SKU <b>if it is build with two threads per core</b> (also known as hyper-threading)</div>`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).redhatter as boolean) {
          message += `<div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00213#product-attributes" target="_blank" >Standard SKU version - RS00213</a></div>
          <div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00212#product-attributes" target="_blank" >Premium SKU version - RS00212</a></div>`;
        }
        showTwoThreads = false;
      }

      message += `<div class="pt-2">With <b>one</b> thread per core</div><div class="pl-3">this requires a total of <b>${Math.ceil(
        totalSKUCores / 2
      )}</b> RS00181 or RS00182 SKUs</div>`;
      if (showTwoThreads) {
        message += `<div class="pt-2">With <b>two</b> threads per core (also known as hyper-threading)</div><div class="pl-3">this requires a total of <b>${Math.ceil(
          totalSKUCores / 4
        )}</b> RS00181 or RS00182 SKUs</div>`;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).redhatter as boolean) {
        message += `<div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00182#product-attributes" target="_blank" >Standard SKU version - RS00182</a></div>
      <div><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00181#product-attributes" target="_blank" >Premium SKU version - RS00181</a></div>`;
      }
    }

    return message + "</div>";
  }

  getODFWorkload(
    targetCapacity: number,
    diskType: Disk,
    deploymentType: DeploymentType,
    nooBaaActive = true,
    rgwActive = true,
    cephFSActive = true,
    nvmeTuning = false,
    dedicatedMachineSets: string[] = []
  ): Workload {
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
        3, // Zones
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
        3, // Zones
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
  }
}

export default Cluster;
