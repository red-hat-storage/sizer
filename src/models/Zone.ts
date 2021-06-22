import { Node } from "./Node";

export class Zone {
  // Contains the nodes in this zone
  nodes: Node[];
  zoneId: string;

  constructor(nodes: Node[], zoneId: string) {
    this.nodes = nodes;
    this.zoneId = zoneId;
  }

  getTotalUsedCPU(): number {
    let totalCPU = 0;
    this.nodes.forEach((node) => {
      totalCPU += node.getUsedCPU();
    });
    return totalCPU;
  }
}
