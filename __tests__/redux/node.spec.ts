import { ServiceDescriptor } from "../../src/types/Service";
import { Platform } from "../../src/types/common";
import { pruneNodes } from "../../src/scheduler/nodePruner";
import { store as mainStore } from "../../src/redux/store";
import { runWorkload } from "../common";
import { isWorkloadSchedulable } from "../../src/utils/workload";
import { MachineSet } from "../../src/types";
import { setPlatform } from "../../src/redux/reducers/cluster";
import { removeNodes } from "../../src/redux/reducers/node";
import { removeServices } from "../../src/redux/reducers/service";
import { removeWorkloads } from "../../src/redux/reducers/workload";

const testServices: ServiceDescriptor[] = [
  {
    name: "A",
    requiredCPU: 1,
    requiredMemory: 3,
    zones: 3,
    runsWith: [],
    avoid: [],
  },
  {
    name: "B",
    requiredCPU: 1,
    requiredMemory: 3,
    zones: 3,
    runsWith: [],
    avoid: [],
  },
];

const platforms = [
  Platform.BAREMETAL,
  Platform.GCP,
  Platform.AZURE,
  Platform.VMware,
  Platform.RHV,
  Platform.AWS,
];

const store = mainStore;
const { dispatch } = store;
let checkSchedulability = null;
describe.each(platforms)("Test Node common Methods", (platform) => {
  beforeEach(() => {
    const state = store.getState();
    dispatch(removeWorkloads(state.workload));
    dispatch(removeServices(state.service.services));
    dispatch(removeNodes(state.node.nodes));
    dispatch(setPlatform(platform));

    pruneNodes(dispatch)(state.node.nodes, state.zone.zones);
  });

  it(`Test fiting small workload ${platform}`, () => {
    // console.debug(state);
    runWorkload({
      name: "smallWorkload",
      count: 1,
      usesMachines: [],
      services: testServices,
    });
    const state = store.getState();
    checkSchedulability = isWorkloadSchedulable(
      state.service.services,
      state.machineSet.filter((ms) => ms.name !== "controlPlane")
    );
    const [isSchedulable, ,]: [boolean, MachineSet[]] = checkSchedulability(
      store.getState().workload[0]
    );
    expect(isSchedulable).toBeTruthy();
  });

  it(`Test too-large workload ${platform}`, () => {
    const largeWorkload = {
      name: "smallWorkload",
      count: 1,
      usesMachines: [],
      services: [
        {
          name: "A",
          requiredCPU: 26,
          requiredMemory: 172,
          zones: 3,
          avoid: [],
          runsWith: [],
        },
      ],
    };
    runWorkload(largeWorkload);
    const state = store.getState();
    checkSchedulability = isWorkloadSchedulable(
      state.service.services,
      state.machineSet.filter((ms) => ms.name !== "controlPlane")
    );
    const [isSchedulable, ,]: [boolean, MachineSet[]] = checkSchedulability(
      store.getState().workload[0]
    );
    expect(isSchedulable).toBeFalsy();
  });

  // it(`Test if existing services are disallowed (canIAddWorkload) ${platform}`, () => {
  //   const workload: Workload = ("deployment-A", services, 3);
  //   const servicesWithDuplicates = [
  //     services[0],
  //     new Service("C", 3, 3, 3, [], []),
  //   ];
  //   const similarWorkLoad: Workload =
  //     ("deployment-A", servicesWithDuplicates, 3);
  //   node.addWorkload(workload, workload.name);
  //   expect(node.canIAddWorkload(similarWorkLoad)).toBeFalsy();
  //   expect(node.canIAddWorkload(workload)).toBeFalsy();
  // });

  // it(`Test if avoiding of coplacement of services is adhered (canIAddWorkload) ${platform}`, () => {
  //   /**
  //    * Tests whether the avoid from existing services is respected.
  //    */
  //   let servicesWithAvoid = [new Service("C", 3, 3, 3, [], ["A"])];
  //   const workload = new Workload("deployment-A", servicesWithAvoid, 3);
  //   node.addWorkload(workload, workload.name);
  //   let unsuitableWorkload = new Workload("deployment-A", services, 3);
  //   expect(node.canIAddWorkload(unsuitableWorkload)).toBeFalsy();
  //   /**
  //    * Tests whether the avoid from new services is respected
  //    */
  //   servicesWithAvoid = [new Service("D", 3, 3, 3, [], ["C"])];
  //   unsuitableWorkload = new Workload("deployment-A", servicesWithAvoid, 3);
  //   expect(node.canIAddWorkload(unsuitableWorkload)).toBeFalsy();
  // });

  // it(`test getAmountOfOSDs ${platform}`, () => {
  //   const cephOSDService = new Service("Ceph_OSD", 6, 6, 3, [], []);
  //   const simpleWorkload = new Workload("ceph-osd", [cephOSDService], 3);
  //   expect(node.addWorkload(simpleWorkload, simpleWorkload.name)).toBeTruthy;
  //   expect(node.getAmountOfOSDs()).toEqual(1);
  // });

  // it(`Test getDetails ${platform}`, () => {
  //   const workload = new Workload("deployment-A", services, 3);
  //   node.addWorkload(workload, workload.name);
  //   const { usedCpuUnits, usedMemory, amountOfOSDs, workloads } =
  //     node.getDetails();
  //   expect(usedCpuUnits).toEqual(6);
  //   expect(usedMemory).toEqual(6);
  //   expect(amountOfOSDs).toEqual(0);
  //   expect(workloads["deployment-A"]).toBe(workload);
  // });
});
