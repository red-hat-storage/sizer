export class Cluster {
  replicaSets: Array<ReplicaSet>;
  platform: string;
  diskType: Disk;
  nodeCPU: number;
  nodeMemory: number;
  deploymentType: string;
  cephFSActive: boolean;
  nooBaaActive: boolean;
  rgwActive: boolean;
  nvmeTuning: boolean;
  canvas: HTMLDivElement;
  static replicaCount = 3;

  constructor(
    platform: string,
    deploymentType: string,
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
    this.nodeCPU = nodeCPU;
    this.nodeMemory = nodeMemory;
    this.cephFSActive = cephFSActive;
    this.nooBaaActive = nooBaaActive;
    this.rgwActive = rgwActive;
    this.nvmeTuning = nvmeTuning;
    // this.calculateIOPs(platform, diskType)
    this.canvas = <HTMLInputElement>$("#canvas-container")[0];
    this.canvas.innerHTML = "";
    this.replicaSets = [
      new ReplicaSet(
        this.platform,
        Cluster.replicaCount,
        this.nodeCPU,
        this.nodeMemory
      ),
    ];
    // this.addReplicaSet();
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
        this.nodeMemory
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
      this.addReplicaSet();
      this.addService(service);
    }
  }
  print(): string {
    return `
    <div class="test-result-text">
      <div class="test-result-text__line">
        To reach the target capacity with the above constraints, we need ${
          this.replicaSets.length * Cluster.replicaCount
        } nodes.
      </div>
      <div class="test-result-text__line">
        Each node has ${
          this.replicaSets[0].nodes[0].cpuUnits
        } <span data-toggle="tooltip" data-placement="top" title="CPU Units are the number of threads you see on the host - you get this number with nproc" style="text-decoration: underline;">CPU Units</span>, ${
      this.replicaSets[0].nodes[0].memory
    } GB memory and a maximum of ${this.replicaSets[0].nodes[0].maxDisks} disks.
      </div>
      <div class="test-result-text__line">
        The disk size in this cluster is ${this.diskType.capacity} TB
      </div>
    </div>
    `;
  }

  printAdvanced(indentation = ""): string {
    let message = '<div class="advanced-result">';
    for (let i = 0; i < this.replicaSets.length; i++) {
      message += `<div class="advanced-result__item"><div class="advanced-result-item__header">Node Set ${
        i + 1
      }</div>
      ${this.replicaSets[i].print(indentation)}</div>`;
    }
    message += "</div>";
    return message;
  }

  printSKU(indentation = ""): string {
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
      "<div class='sku-block'>" +
      `<div class='sku-block__item'>Based on your input, OCS will require of a total of ${totalCores} <span data-toggle="tooltip" data-placement="top" title="CPU Units are the number of threads you see on the host - you get this number with nproc" style="text-decoration: underline;">CPU Units</span>, ${totalMemory} GB RAM and ${totalDisks} OSDs</div>`;
    message += `<div class='sku-block__item'>For the Red Hat SKU calculation we need to use the total instance CPU Unit count of ${totalSKUCores} <span data-toggle="tooltip" data-placement="top" title="CPU Units are the number of threads you see on the host - you get this number with nproc" style="text-decoration: underline;">CPU Units</span></div>`;
    if (totalSKUCores <= 48) {
      message +=
        "<div class='sku-block__item'>This cluster is small enough to qualify for a StarterPack SKU!</div>";
      message += `<div class='sku-block__item'><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00213#product-attributes" >Standard SKU version - RS00213</a></div>
      <div class='sku-block__item'><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00212#product-attributes" >Premium SKU version - RS00212</a></div>`;
    } else {
      message +=
        indentation +
        `<div class='sku-block__item'>This requires a total of ${Math.ceil(
          totalSKUCores / 2
        )} RS00181 or RS00182 SKUs</div>`;
      message += `<div class='sku-block__item'><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00181#product-attributes" >Standard SKU version - RS00181</a></div>
      <div class='sku-block__item'><a href="https://offering-manager.corp.redhat.com/offerings/view/RS00182#product-attributes" >Premium SKU version - RS00182</a></div>`;
    }
    return message + "</div>";
  }

  draw(): void {
    this.replicaSets.forEach((replicaSet) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.classList.add("p-3");
      const cardDeck = document.createElement("div");
      cardDeck.classList.add("card-deck");
      replicaSet.draw(cardDeck);
      row.appendChild(cardDeck);
      this.canvas.appendChild(row);
    });
  }
}

export class ReplicaSet {
  replicaCount: number;
  platform: string;
  nodes: Array<Node>;

  constructor(
    platform: string,
    replicaCount: number,
    nodeCPU: number,
    nodeMemory: number
  ) {
    this.replicaCount = replicaCount;
    this.platform = platform;
    this.nodes = [];
    for (let i = 0; i < this.replicaCount; i++) {
      switch (this.platform) {
        case "metal":
          this.nodes.push(new BareMetal(24, nodeCPU, nodeMemory));
          break;
        case "awsAttached":
          this.nodes.push(new AWSattached());
          break;
        case "awsEBS":
          this.nodes.push(new AWSEBS());
          break;
        case "gcp":
          this.nodes.push(new GCP());
          break;
        case "azure":
          this.nodes.push(new Azure());
          break;
        case "vm":
        case "vmPreview":
          this.nodes.push(new VMnode(24, nodeCPU, nodeMemory));
          break;
      }
    }
  }

  addService(service: Service): boolean {
    let serviceAddRefused = false;
    switch (Object.getPrototypeOf(service).constructor) {
      // Services running on 3 nodes
      case Ceph_MON:
      case Ceph_OSD:
        this.nodes.forEach((node) => {
          if (!node.canIAddService(service)) {
            serviceAddRefused = true;
          }
        });
        if (serviceAddRefused) return false;
        this.nodes.forEach((node) => {
          node.addService(service);
        });
        return true;
      // Services running on 2 nodes
      case Ceph_MDS:
      case Ceph_MGR:
      case Ceph_RGW:
      case NooBaa_DB:
      case NooBaa_Endpoint:
      case NooBaa_core:
        // Sort nodes ascending based on used CPU
        this.nodes.sort(function (a, b) {
          if (a.getUsedCPU() < b.getUsedCPU()) return -1;
          else return 1;
        });
        for (let i = 0; i < Math.min(this.nodes.length, 2); i++) {
          const node = this.nodes[i];
          if (!node.canIAddService(service)) return false;
        }
        for (let i = 0; i < Math.min(this.nodes.length, 2); i++) {
          const node = this.nodes[i];
          node.addService(service);
        }
        return true;
    }
    return false;
  }

  print(indentation = ""): string {
    let message = "";
    for (let i = 0; i < this.nodes.length; i++) {
      message += `<div class='rs-block'><div class='rs-block__title'>${indentation} Node ${
        i + 1
      }</div> <div class='rs-block__body'>${this.nodes[i].print(
        indentation + indentation
      )}</div></div>`;
    }
    return message;
  }

  draw(cardDeck: HTMLDivElement): void {
    this.nodes.forEach((node) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
              <h4 class="card-header text-center">OpenShift node</h4>
              <h6 class="card-header text-center bg-white">${node.getFittingNodeSize()}</h6>
              <div class="row">
                <div class="col pt-3 mr-0 pr-0">
                  <img
                  class="card-img-top img-disk"
                  src="assets/Icon-Red_Hat-Hardware-Storage-A-Red-RGB.png"
                  alt="Disks on Node"
                  />
                </div>
                <div class="col align-middle ml-0 pl-0" style="align-self: center;">
                  <h1 class="">x${node.getAmountOfOSDs()}</h1>
                </div>
              </div>
              <div class="card-body pl-6">
                <p class="card-text">OCS services consume:

                <h5 class="pl-3">
                  ${node.getUsedCPU()} CPU units<br />
                  ${node.getUsedMemory()}GB RAM
                </h5></p>
              </div>
              </div>
              `;
      cardDeck.appendChild(card);
    });
  }
}

export abstract class Node {
  maxDisks: number;
  cpuUnits: number;
  memory: number;
  services: Array<Service>;

  constructor(maxDisks = 0, cpuUnits = 0, memory = 0) {
    this.services = [];

    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getUsedMemory(): number {
    let totalMemory = 0;
    this.services.forEach((service) => {
      totalMemory += service.requiredMemory;
    });
    return totalMemory;
  }
  getUsedCPU(): number {
    let totalCores = 0;
    this.services.forEach((service) => {
      totalCores += service.requiredCPU;
    });
    return 2 * Math.round(Math.ceil(totalCores) / 2);
  }
  canIAddService(service: Service): boolean {
    if (
      this.getUsedCPU() + service.requiredCPU > this.cpuUnits ||
      this.getUsedMemory() + service.requiredMemory > this.memory
    ) {
      return false;
    }
    if (
      service instanceof Ceph_OSD &&
      this.getAmountOfOSDs() >= this.maxDisks
    ) {
      return false;
    }
    return true;
  }
  addService(service: Service): boolean {
    if (this.canIAddService(service)) {
      this.services.push(service);
      return true;
    }
    return false;
  }
  getAmountOfOSDs(): number {
    let osdCount = 0;
    this.services.forEach((service) => {
      if (service instanceof Ceph_OSD) {
        osdCount++;
      }
    });
    return osdCount;
  }
  nodeHasService(service: Service): boolean {
    this.services.forEach((nodeService) => {
      if (nodeService instanceof Object.getPrototypeOf(service)) {
        return true;
      }
    });
    return false;
  }

  print(indentation = ""): string {
    let message = '<div class="node-list">';
    message += `<div class="node-list__title">${indentation} This node has ${this.getUsedCPU()}/${
      this.cpuUnits
    } used CPU units, ${this.getUsedMemory()}/${
      this.memory
    } used GB of memory and ${this.getAmountOfOSDs()}/${
      this.maxDisks
    } disks.</div>`;
    message +=
      indentation +
      "<div class='node-list__subtitle'>SERVICES ON THIS Node:</div>";
    this.services.forEach((service) => {
      message += `<div class="node-list__item">${service.print(
        indentation + indentation
      )}</div>`;
    });
    message += "</div>";
    return message;
  }

  abstract getFittingNodeSize(): string;
}

export class BareMetal extends Node {
  constructor(maxDisks = 24, cpuUnits = 24, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    return `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
  }
}

export class VMnode extends Node {
  // Per node we can have at most 30 disks per SATA adapter and
  // max 4 adapters = 120 disks in total (minus OS disk)
  // https://configmax.vmware.com/guest?vmwareproduct=vSphere&release=vSphere%207.0&categories=1-0

  constructor(maxDisks = 24, cpuUnits = 40, memory = 128) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    return `${this.cpuUnits} CPUs | ${this.memory} GB RAM`;
  }
}

export class AWSattached extends Node {
  // node storage i3en.2xl
  // 2 x 2.5TB disks
  constructor(maxDisks = 2, cpuUnits = 8, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    if (this.getAmountOfOSDs() == 0) {
      return "m5.2xlarge";
    }
    return "i3en.2xlarge";
  }
}

export class AWSEBS extends Node {
  // node with EBS based on m5 nodes

  // Linux nodes should not have more than 40 EBS volumes
  // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/volume_limits.html#linux-specific-volume-limits
  constructor(maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    return "m5.4xlarge";
  }
}

export class GCP extends Node {
  // Based on findings e2-standard-16 is the best general instance
  // https://docs.google.com/document/d/1COHDVAVJCQovy1YKru9tZ5-GJv0cNXzVQ6t2m2c9-Jo/edit#
  // For high-IOPs n2-standard-16 is better

  constructor(maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    return "e2-standard-16";
  }
}

export class Azure extends Node {
  // Based on our findings the D16s_v3 has a good performance and price
  // https://docs.google.com/document/d/1-SIa219F0T13Yn1MQMrsP7O1sw8Auy97GCiqfst0J74/edit#
  constructor(maxDisks = 24, cpuUnits = 16, memory = 64) {
    super();
    this.maxDisks = maxDisks;
    this.cpuUnits = cpuUnits;
    this.memory = memory;
  }

  getFittingNodeSize(): string {
    return "D16s_v3";
  }
}

export class Disk {
  capacity: number;
  iops = 0;
  constructor(capacity: number) {
    this.capacity = capacity;
  }
}

export abstract class Service {
  requiredMemory: number;
  requiredCPU: number;

  constructor(deploymentType: string) {
    deploymentType;
    this.requiredCPU = 0;
    this.requiredMemory = 0;
  }

  abstract print(indentation: string): string;
}

export class NooBaa_core extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 1;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "NooBaa Core";
  }
}

export class NooBaa_DB extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 0.5;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "NooBaa DB";
  }
}

export class NooBaa_Endpoint extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 2;
        this.requiredCPU = 1;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "NooBaa Endpoint";
  }
}

export class Ceph_MDS extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 8;
        this.requiredCPU = 1;
        break;
      default:
        this.requiredMemory = 8;
        this.requiredCPU = 3;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "Ceph MDS";
  }
}

export class Ceph_MGR extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 3.5;
        this.requiredCPU = 1;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "Ceph MGR";
  }
}

export class Ceph_MON extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 2;
        this.requiredCPU = 1;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "Ceph MON";
  }
}

export class Ceph_OSD extends Service {
  constructor(deploymentType: string, nvmeTuning: boolean) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 5;
        this.requiredCPU = 1;
        break;
      // "standard"
      default:
        this.requiredMemory = 5;
        this.requiredCPU = 2;
        break;
    }
    if (nvmeTuning) {
      // https://docs.google.com/document/d/1zqckcf4NllPvcKEHBs4wOzReG55P_GwvxdJ-1QajreY/edit#
      this.requiredCPU = 5;
    }
  }

  print(indentation = ""): string {
    return indentation + "Ceph OSD";
  }
}

export class Ceph_RGW extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 4;
        this.requiredCPU = 1;
        break;
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 2;
        break;
    }
  }

  print(indentation = ""): string {
    return indentation + "Ceph RGW";
  }
}
