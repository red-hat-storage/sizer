import { DeploymentType, Platform } from "../types";
import {
  Node,
  BareMetal,
  AWSattached,
  AWSEBS,
  Azure,
  GCP,
  VMnode,
} from "./Node";
import Service, {
  Ceph_MON,
  Ceph_OSD,
  Ceph_MDS,
  Ceph_MGR,
  Ceph_RGW,
  NooBaa_DB,
  NooBaa_Endpoint,
  NooBaa_core,
} from "./Service";

const ZONES = ["us-east-1", "us-east-2", "us-east-3", "us-east-4", "us-east-5"];
const RACKS = ["rack-0", "rack-1", "rack-2", "rack-3", "rack-4"];

class ReplicaSet {
  replicaCount: number;
  platform: Platform;
  nodes: Array<Node>;
  deploymentType: string;

  constructor(
    platform: Platform,
    replicaCount: number,
    nodeCPU: number,
    nodeMemory: number,
    deploymentType: DeploymentType
  ) {
    this.replicaCount = replicaCount;
    this.platform = platform;
    this.deploymentType = deploymentType;
    this.nodes = [];
    for (let i = 0; i < this.replicaCount; i++) {
      switch (this.platform) {
        case Platform.BAREMETAL:
          this.nodes.push(new BareMetal(RACKS[i], 24, nodeCPU, nodeMemory));
          break;
        case Platform.AWSi3:
          this.nodes.push(new AWSattached(ZONES[i]));
          break;
        case Platform.AWSm5:
          this.nodes.push(new AWSEBS(ZONES[i]));
          break;
        case Platform.GCP:
          this.nodes.push(new GCP(ZONES[i]));
          break;
        case Platform.AZURE:
          this.nodes.push(new Azure(ZONES[i]));
          break;
        case Platform.VMware:
        case Platform.RHV:
          this.nodes.push(new VMnode(RACKS[i], 24, nodeCPU, nodeMemory));
          break;
      }
    }
  }

  addOCPService(cpuUnits: number, memory: number): void {
    // A per-node "cost" that we should add to the nodes
    this.nodes.forEach((node) => {
      node.addOCPService(cpuUnits, memory);
    });
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
  /*
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
  */
  /*
  draw(cardDeck: HTMLDivElement): void {
    const nodeLabel = (function (deploymentType) {
      switch (deploymentType) {
        case "external":
          return "External node";
        case "compact":
          return "OpenShift supervisor";
        default:
          return "OpenShift node";
      }
    })(this.deploymentType);

    this.nodes.forEach((node) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.classList.add("md-auto");
      if (this.deploymentType == "external") {
        card.classList.add("text-white");
        card.classList.add("bg-dark");
      }
      // let ocpServiceCostBlock = "";
      // if (node.ocpCPUUnits > 0 || node.ocpMemory > 0) {
      //   ocpServiceCostBlock = `
      //       <p class="card-text">OCP services consume:

      //       <h5 class="pl-3">
      //         ${node.ocpCPUUnits} CPU units<br />
      //         ${node.ocpMemory}GB RAM
      //       </h5></p>
      //   `;
      // }
      const ocsCpuPercentage = (node.getUsedCPU() / node.cpuUnits) * 100;
      const ocpCpuPercentage = (node.ocpCPUUnits / node.cpuUnits) * 100;
      const cpuToolTip = `Total CPU units: ${node.cpuUnits} units
OCS consumes: ${node.getUsedCPU()} units
OCP consumes: ${node.ocpCPUUnits} units`;
      const ocsMemPercentage = (node.getUsedMemory() / node.memory) * 100;
      const ocpMemPercentage = (node.ocpMemory / node.memory) * 100;
      const memToolTip = `Total Memory:   ${node.memory} GB
OCS consumes: ${node.getUsedMemory()} GB
OCP consumes: ${node.ocpMemory} GB`;
      card.innerHTML = `
              <h4 class="card-header text-center">${nodeLabel}</h4>
              <h6 class="card-header text-center nodeSize">${node.getFittingNodeSize()}</h6>
              <div class="row justify-content-md-start pl-4">
                <div class="col p-2 mr-0 pr-0">
                  <img
                  class="card-img-top img-disk"
                  src="assets/Icon-Red_Hat-Hardware-Storage-A-Red-RGB.png"
                  alt="Disks on Node"
                  />
                </div>
                <div class="col align-middle ml-0 pl-0" style="align-self: center;">
                  <h1 class="nodeDiskAmount">x${node.getAmountOfOSDs()}</h1>
                </div>
              </div>
              <div class="card-body pl-6 nodeUsedResources">
              <div class="container">
                <div class="row">
                  <label class="col-4" for="usedCPU">CPU</label>
                  <div class="col">
                    <div class="progress" id="usedCPU" data-toggle="tooltip" data-placement="top" title="${cpuToolTip}">
                      <div class="progress-bar" role="progressbar" style="width: ${ocsCpuPercentage}%" aria-valuenow="${ocsCpuPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                      <div class="progress-bar bg-warning" role="progressbar" style="width: ${ocpCpuPercentage}%" aria-valuenow="${ocpCpuPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <label class="col-4" for="usedMem">Memory</label>
                  <div class="col">
                    <div class="progress" id="usedMem" data-toggle="tooltip" data-placement="top" title="${memToolTip}">
                      <div class="progress-bar" role="progressbar" style="width: ${ocsMemPercentage}%" aria-valuenow="${ocsMemPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                      <div class="progress-bar bg-warning" role="progressbar" style="width: ${ocpMemPercentage}%" aria-valuenow="${ocpMemPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              </div>
              `;
      cardDeck.appendChild(card);
    });
  }
  */
}

export default ReplicaSet;
