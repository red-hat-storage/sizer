import { Node } from "./Node";

export class Zone {
  // Contains the nodes in this zone
  nodes: Node[];

  constructor(nodes: Node[]) {
    this.nodes = nodes;
  }

  getTotalUsedCPU(): number {
    let totalCPU = 0;
    this.nodes.forEach((node) => {
      totalCPU += node.getUsedCPU();
    });
    return totalCPU;
  }
}
