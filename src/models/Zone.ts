import { Node } from "./Node";

export class Zone {
  // Contains the nodes in this zone
  nodes: Node[];

  constructor(nodes: Node[]) {
    this.nodes = nodes;
  }
}
