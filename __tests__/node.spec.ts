import { BareMetal, Node } from "../src/models/Node";
import { Service } from "../src/models/Service";
import { Workload } from "../src/models/Workload";

const services = [
  new Service("A", 3, 3, 3, [], []),
  new Service("B", 3, 3, 3, [], []),
];

describe("Test Node common Methods", () => {
  let node: Node;

  beforeEach(() => {
    node = new BareMetal();
  });

  it("Test fiting workload (canIAddWorkload)", () => {
    const fittingWorkload = new Workload("smallWorkload", services, 5);
    expect(node.canIAddWorkload(fittingWorkload)).toBeTruthy();
  });

  it("Test larger workload (canIAddWorkload)", () => {
    const largeWorkload = new Workload(
      "largeWorkload",
      [new Service("A", 16, 72, 3, [], [])],
      3
    );
    expect(node.canIAddWorkload(largeWorkload)).toBeFalsy();
  });

  it("Test if existing services are disallowed (canIAddWorkload)", () => {
    const workload = new Workload("deployment-A", services, 3);
    const servicesWithDuplicates = [
      services[0],
      new Service("C", 3, 3, 3, [], []),
    ];
    const similarWorkLoad = new Workload(
      "deployment-A",
      servicesWithDuplicates,
      3
    );
    node.addWorkload(workload);
    expect(node.canIAddWorkload(similarWorkLoad)).toBeFalsy();
    expect(node.canIAddWorkload(workload)).toBeFalsy();
  });

  it("Test if avoiding of coplacement of services is adhered (canIAddWorkload)", () => {
    /**
     * Tests whether the avoid from existing services is respected.
     */
    let servicesWithAvoid = [new Service("C", 3, 3, 3, [], ["A"])];
    const workload = new Workload("deployment-A", servicesWithAvoid, 3);
    node.addWorkload(workload);
    let unsuitableWorkload = new Workload("deployment-A", services, 3);
    expect(node.canIAddWorkload(unsuitableWorkload)).toBeFalsy();
    /**
     * Tests whether the avoid from new services is respected
     */
    servicesWithAvoid = [new Service("D", 3, 3, 3, [], ["C"])];
    unsuitableWorkload = new Workload("deployment-A", servicesWithAvoid, 3);
    expect(node.canIAddWorkload(unsuitableWorkload)).toBeFalsy();
  });

  it("test getAmountOfOSDs", () => {
    const cephOSDService = new Service("Ceph_OSD", 6, 6, 3, [], []);
    const simpleWorkload = new Workload("ceph-osd", [cephOSDService], 3);
    node.addWorkload(simpleWorkload);
    expect(node.getAmountOfOSDs()).toEqual(1);
  });

  it("Test getDetails", () => {
    const workload = new Workload("deployment-A", services, 3);
    node.addWorkload(workload);
    const {
      usedCpuUnits,
      usedMemory,
      amountOfOSDs,
      workloads,
    } = node.getDetails();
    expect(usedCpuUnits).toEqual(6);
    expect(usedMemory).toEqual(6);
    expect(amountOfOSDs).toEqual(0);
    expect(workloads["deployment-A"]).toBe(workload);
  });
});
