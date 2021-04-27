import { DeploymentDetails, DeploymentType, Platform } from "../types";
import Service, {
  Ceph_MDS,
  Ceph_MGR,
  Ceph_MON,
  Ceph_OSD,
  Ceph_RGW,
  NooBaa_DB,
  NooBaa_Endpoint,
  NooBaa_core,
} from "./Service";
import Disk from "./Disk";
import ReplicaSet from "./ReplicaSet";

class Cluster {
  replicaSets: Array<ReplicaSet>;
  platform: Platform;
  diskType: Disk;
  targetCapacity: number;
  nodeCPU: number;
  nodeMemory: number;
  deploymentType: DeploymentType;
  cephFSActive: boolean;
  nooBaaActive: boolean;
  rgwActive: boolean;
  nvmeTuning: boolean;
  //   canvas: HTMLDivElement;
  static replicaCount = 3;

  constructor(
    platform: Platform,
    deploymentType: DeploymentType,
    diskType: Disk,
    targetCapacity: number,
    nodeCPU: number,
    nodeMemory: number,
    cephFSActive: boolean,
    nooBaaActive: boolean,
    rgwActive: boolean,
    nvmeTuning: boolean
  ) {
    this.platform = platform;
    this.deploymentType = deploymentType;
    this.diskType = diskType;
    this.targetCapacity = targetCapacity;
    this.nodeCPU = nodeCPU;
    this.nodeMemory = nodeMemory;
    this.cephFSActive = cephFSActive;
    this.nooBaaActive = nooBaaActive;
    this.rgwActive = rgwActive;
    this.nvmeTuning = nvmeTuning;
    // this.canvas = <HTMLInputElement>$("#canvas-container")[0];
    // this.canvas.innerHTML = "";
    this.replicaSets = [
      new ReplicaSet(
        this.platform,
        Cluster.replicaCount,
        this.nodeCPU,
        this.nodeMemory,
        // First ReplicaSet is always internal
        this.deploymentType == DeploymentType.EXTERNAL
          ? DeploymentType.INTERNAL
          : this.deploymentType
      ),
    ];
    if (deploymentType == DeploymentType.EXTERNAL) {
      // I know... we could reorder adding the Pods and make this shorter
      // but this mimiks the way Pods are added and reordering it for
      // non-external deployments would result in different
      // CPU&Mem calculations.
      this.addService(new NooBaa_DB(this.deploymentType));
      this.addService(new NooBaa_Endpoint(this.deploymentType));
      this.addService(new NooBaa_core(this.deploymentType));
      this.addReplicaSet();
      nooBaaActive = false;
    } else if (deploymentType == DeploymentType.COMPACT) {
      this.replicaSets[0].addOCPService(2, 8);
    }
    this.addService(new Ceph_MGR(this.deploymentType));
    this.addService(new Ceph_MON(this.deploymentType));
    if (rgwActive) {
      this.addService(new Ceph_RGW(this.deploymentType));
    }
    if (cephFSActive) {
      this.addService(new Ceph_MDS(this.deploymentType));
    }
    if (nooBaaActive) {
      this.addService(new NooBaa_DB(this.deploymentType));
      this.addService(new NooBaa_Endpoint(this.deploymentType));
      this.addService(new NooBaa_core(this.deploymentType));
    }

    const osdsNeededForTargetCapacity = Math.ceil(
      targetCapacity / diskType.capacity
    );

    for (let i = 0; i < osdsNeededForTargetCapacity; i++) {
      this.addService(new Ceph_OSD(this.deploymentType, this.nvmeTuning));
    }
  }

  addReplicaSet(): void {
    this.replicaSets.push(
      new ReplicaSet(
        this.platform,
        Cluster.replicaCount,
        this.nodeCPU,
        this.nodeMemory,
        this.deploymentType
      )
    );
  }

  addService(service: Service): void {
    // Use the replicaSet that was added last
    // We assume that we fill up replicaSets before we add new ones
    const targetSet = this.replicaSets[this.replicaSets.length - 1];
    if (!targetSet.addService(service)) {
      // If the set refuses to add the service
      // it is probably already full - then add a new set
      // UNLESS we are using compact mode
      if (this.deploymentType === DeploymentType.COMPACT) {
        // main.compactWarn();
        return;
      }
      this.addReplicaSet();
      this.addService(service);
    }
  }

  getDetails(): DeploymentDetails {
    return {
      ocpNodes: this.replicaSets.length * Cluster.replicaCount,
      cpuUnits: this.replicaSets[0].nodes[0].cpuUnits,
      memory: this.replicaSets[0].nodes[0].memory,
      capacity: this.diskType.capacity,
      deploymentType: this.deploymentType,
      nvmeTuning: this.nvmeTuning,
      warningFirst: this.targetCapacity * 0.75,
      warningSecond: this.targetCapacity * 0.85,
      replicaSets: this.replicaSets,
    };
  }

  // Todo: Take it to the new world!
  printSKU(): string {
    let totalSKUCores = 0,
      totalCores = 0,
      totalMemory = 0,
      totalDisks = 0;
    for (let i = 0; i < this.replicaSets.length; i++) {
      const replicaSet = this.replicaSets[i];
      for (let j = 0; j < replicaSet.nodes.length; j++) {
        const node = replicaSet.nodes[j];
        // SKUs cannot be shared between nodes
        // Thus we need to round up to the next round number
        totalCores += node.getUsedCPU();
        totalSKUCores += node.cpuUnits;
        totalMemory += node.getUsedMemory();
        totalDisks += node.getAmountOfOSDs();
      }
    }
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

  /*
  draw(): void {
    this.replicaSets.forEach((replicaSet) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.classList.add("p-3");
      const cardDeck = document.createElement("div");
      cardDeck.classList.add("card-deck");
      cardDeck.classList.add("w-100");
      replicaSet.draw(cardDeck);
      row.appendChild(cardDeck);
      // this.canvas.appendChild(row);
    });
  }
  */
}

export default Cluster;
