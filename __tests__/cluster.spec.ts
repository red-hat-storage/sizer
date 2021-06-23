import { Platform } from "../src/types";
import Cluster, { generateODFWorkload } from "../src/models/Cluster";
import Disk from "../src/models/Disk";
import { DeploymentType } from "../src/types";
import { MachineSet } from "../src/models/MachineSet";
import { Workload } from "../src/models/Workload";
import { Service } from "../src/models/Service";

type testmatrix = {
  platform: Platform;
  deploymentType: DeploymentType;
};

const platforms = [
  Platform.BAREMETAL,
  Platform.AWSi3,
  Platform.AWSm5,
  Platform.AZURE,
  Platform.GCP,
  Platform.RHV,
  Platform.VMware,
];

const deploymentTypes = [
  DeploymentType.INTERNAL,
  DeploymentType.MINIMAL,
  DeploymentType.EXTERNAL,
  DeploymentType.COMPACT,
];

const matrix: testmatrix[] = [];
deploymentTypes.map(function (deployItem) {
  platforms.map(function (platformItem) {
    matrix.push({ deploymentType: deployItem, platform: platformItem });
  });
});

describe.each(matrix)("Test Clusters", (testConfig) => {
  const testWorkload = new Workload(
    "test",
    [new Service("svc-Z", 0, 0, 1, [], [])],
    0
  );
  const cluster = new Cluster(
    testConfig.deploymentType,
    new Disk(2.5),
    [
      new MachineSet("default", 8, 64, testConfig.platform, "", 24, []),
      new MachineSet("odf", 8, 64, testConfig.platform, "", 24, [
        "ODF-0",
        "svc-Z-0",
      ]),
    ],
    2.5,
    true,
    true,
    true,
    false,
    [testWorkload]
  );

  it(`Test Cluster Details for ${testConfig.deploymentType} on ${testConfig.platform}`, () => {
    const {
      ocpNodes,
      cpuUnits,
      memory,
      diskCapacity,
      zones,
    } = cluster.getDetails();

    switch (testConfig.deploymentType) {
      case DeploymentType.EXTERNAL:
        expect(ocpNodes).toBe(9);
        expect(cpuUnits).toBe(9 * 8);
        expect(memory).toBe(9 * 64);
        break;
      case DeploymentType.COMPACT:
      case DeploymentType.MINIMAL:
        expect(ocpNodes).toBe(3);
        expect(cpuUnits).toBe(3 * 8);
        expect(memory).toBe(3 * 64);
        break;
      default:
        expect(ocpNodes).toBe(6);
        expect(cpuUnits).toBe(6 * 8);
        expect(memory).toBe(6 * 64);
        break;
    }
    expect(diskCapacity).toBe(2.5);
    expect(zones.length).toBe(3);
  });

  it(`Replace ODF workload for ${testConfig.deploymentType} on ${testConfig.platform}`, () => {
    const newODFWorkload = generateODFWorkload(
      5,
      new Disk(2.5),
      testConfig.deploymentType,
      false,
      false,
      false,
      true,
      ["odf"]
    );
    newODFWorkload.name = "ODF-0";
    cluster.replaceWorkload(newODFWorkload);

    const {
      ocpNodes,
      cpuUnits,
      memory,
      diskCapacity,
      zones,
    } = cluster.getDetails();
    switch (testConfig.deploymentType) {
      case DeploymentType.EXTERNAL:
        expect(ocpNodes).toBe(18);
        expect(cpuUnits).toBe(18 * 8);
        expect(memory).toBe(18 * 64);
        break;
      case DeploymentType.COMPACT:
      case DeploymentType.MINIMAL:
        expect(ocpNodes).toBe(3);
        expect(cpuUnits).toBe(3 * 8);
        expect(memory).toBe(3 * 64);
        break;
      default:
        expect(ocpNodes).toBe(9);
        expect(cpuUnits).toBe(9 * 8);
        expect(memory).toBe(9 * 64);
        break;
    }
    expect(diskCapacity).toBe(2.5);
    expect(zones.length).toBe(3);
  });

  it(`Test Co-located services for ${testConfig.deploymentType} on ${testConfig.platform}`, () => {
    cluster.zones = [];
    const workload = new Workload(
      "colocated",
      [
        new Service("svc-A", 4, 2, 2, ["svc-B"], []),
        new Service("svc-B", 1, 2, 1, ["svc-A"], []),
      ],
      0
    );
    cluster.addWorkload(workload);
    const {
      ocpNodes,
      cpuUnits,
      memory,
      diskCapacity,
      zones,
    } = cluster.getDetails();
    expect(ocpNodes).toBe(2);
    expect(cpuUnits).toBe(16);
    expect(memory).toBe(128);
    expect(diskCapacity).toBe(2.5);
    expect(zones.length).toBe(2);
    const zoneOne = cluster.zones[0].nodes[0].getDetails();
    // 2 * Math.round(Math.ceil(5) / 2) == 6
    expect(zoneOne.usedCpuUnits).toBe(6);
    expect(zoneOne.amountOfOSDs).toBe(0);
    expect(zoneOne.usedMemory).toBe(4);
    expect(Object.keys(zoneOne.workloads["colocated-0"].services).length).toBe(
      2
    );
    const zoneTwo = cluster.zones[1].nodes[0].getDetails();
    expect(zoneTwo.usedCpuUnits).toBe(6);
    expect(zoneTwo.amountOfOSDs).toBe(0);
    expect(zoneTwo.usedMemory).toBe(4);
    expect(Object.keys(zoneTwo.workloads["colocated-0"].services).length).toBe(
      2
    );
  });
  it(`Test avoiding services for ${testConfig.deploymentType} on ${testConfig.platform}`, () => {
    cluster.zones = [];
    const workload = new Workload(
      "avoiding",
      [
        new Service("svc-A", 4, 2, 1, [], ["svc-B"]),
        new Service("svc-B", 1, 2, 1, [], ["svc-A"]),
      ],
      0,
      1,
      ["odf"]
    );
    cluster.addWorkload(workload);
    const {
      ocpNodes,
      cpuUnits,
      memory,
      diskCapacity,
      zones,
    } = cluster.getDetails();
    expect(ocpNodes).toBe(2);
    expect(cpuUnits).toBe(16);
    expect(memory).toBe(128);
    expect(diskCapacity).toBe(2.5);
    expect(zones.length).toBe(1);
    expect(cluster.zones[0].nodes.length).toBe(2);
    const nodeOne = cluster.zones[0].nodes[0].getDetails();
    expect(nodeOne.usedCpuUnits).toBe(4);
    expect(nodeOne.amountOfOSDs).toBe(0);
    expect(nodeOne.usedMemory).toBe(2);
    expect(Object.keys(nodeOne.workloads).length).toBe(1);
    const nodeTwo = cluster.zones[0].nodes[1].getDetails();
    // 2 * Math.round(Math.ceil(1) / 2) == 2
    expect(nodeTwo.usedCpuUnits).toBe(2);
    expect(nodeTwo.amountOfOSDs).toBe(0);
    expect(nodeTwo.usedMemory).toBe(2);
    expect(Object.keys(nodeTwo.workloads).length).toBe(1);
  });
});
