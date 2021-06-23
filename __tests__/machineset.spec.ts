import { MachineSet } from "../src/models/MachineSet";
import {
  AWSattached,
  AWSEBS,
  Azure,
  BareMetal,
  GCP,
  Node,
  VMnode,
} from "../src/models/Node";
import { Platform } from "../src/types";

const platforms = [
  Platform.BAREMETAL,
  Platform.AWSi3,
  Platform.AWSm5,
  Platform.AZURE,
  Platform.GCP,
  Platform.RHV,
  Platform.VMware,
];

describe.each(platforms)("Test MachineSets", (platform) => {
  const machineSet = new MachineSet("test", 16, 64, platform, "", 24, []);
  let testNode: Node;
  switch (platform) {
    case Platform.BAREMETAL:
      testNode = new BareMetal();
      break;
    case Platform.AWSi3:
      testNode = new AWSattached();
      break;
    case Platform.AWSm5:
      testNode = new AWSEBS();
      break;
    case Platform.AZURE:
      testNode = new Azure();
      break;
    case Platform.GCP:
      testNode = new GCP();
      break;
    case Platform.RHV:
    case Platform.VMware:
      testNode = new VMnode();
      break;
  }

  it(`Test getNewNode on ${platform}`, () => {
    expect(machineSet.getNewNode().constructor.name).toBe(
      testNode.constructor.name
    );
  });
});
