import { defaultWorkloads } from "../../src/components/Workload/defaultWorkloads";
import { MachineSet, WorkloadDescriptor } from "../../src/types";
import { addMachineSet } from "../../src/redux/reducers/machineSet";
import { store as mainStore } from "../../src/redux/store";
import { workloadScheduler } from "../../src/scheduler/workloadScheduler";
import { getWorkloadFromDescriptors } from "../../src/utils/workload";
import { addServices } from "../../src/redux/reducers/service";
import { addWorkload } from "../../src/redux/reducers/workload";

const kafkaWorkloadDescriptor: WorkloadDescriptor = defaultWorkloads.find(
  (wl) => wl.name === "Kafka"
) as WorkloadDescriptor;

const { services: kafkaServices, workload: kafkaWorkload } =
  getWorkloadFromDescriptors(kafkaWorkloadDescriptor);

const store = mainStore;
const { dispatch } = store;

describe("Test scheduler", () => {
  it("Should create machinetSet", () => {
    const machineSet: MachineSet = {
      name: "test",
      cpu: 96,
      memory: 512,
      instanceName: "m5.4xlarge",
      numberOfDisks: 2,
      onlyFor: ["Kafka"],
      label: "worker-us",
    };
    dispatch(addMachineSet(machineSet));
    expect(
      !!store.getState().machineSet.find((ms) => ms.name === machineSet.name)
    ).toBeTruthy();
  });
  it("Should schedule workload", () => {
    dispatch(addServices(kafkaServices));
    dispatch(addWorkload(kafkaWorkload));
    const state = store.getState();
    const { service, workload, machineSet } = state;
    const usedZonesId: number[] = [];
    workloadScheduler(store, dispatch)(
      workload[0],
      service.services,
      machineSet,
      usedZonesId
    );
  });
});
