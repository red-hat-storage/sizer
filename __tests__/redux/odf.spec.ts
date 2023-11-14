import { getODFWorkload } from "../../src/workloads";
import { MachineSet } from "../../src/types";
import { store as mainStore } from "../../src/redux/store";
import { workloadScheduler } from "../../src/scheduler/workloadScheduler";
import { getWorkloadFromDescriptors } from "../../src/utils/workload";
import { DeploymentType } from "../../src/types";
import { ODF_WORKLOAD_NAME } from "../../src/constants";
import { addMachineSet } from "../../src/redux/reducers/machineSet";
import { addServices, editServices } from "../../src/redux/reducers/service";
import { addWorkload, editWorkload } from "../../src/redux/reducers/workload";

const { services: odfServices, workload: odfWorkload } =
  getWorkloadFromDescriptors(
    getODFWorkload(
      10,
      2.5,
      DeploymentType.INTERNAL,
      [],
      true,
      true,
      true,
      false
    )
  );
const { services: odfExternalServices, workload: odfExternalWorkload } =
  getWorkloadFromDescriptors(
    getODFWorkload(
      10,
      2.5,
      DeploymentType.EXTERNAL,
      [],
      true,
      true,
      true,
      false
    )
  );
const { services: odfCompactServices, workload: odfCompactWorkload } =
  getWorkloadFromDescriptors(
    getODFWorkload(10, 2.5, DeploymentType.COMPACT, [], true, true, true, false)
  );

const store = mainStore;
const { dispatch } = store;

describe("Test ODF schedule", () => {
  it("Should create machinetSet", () => {
    const machineSet: MachineSet = {
      name: "test",
      cpu: 96,
      memory: 512,
      instanceName: "m5.4xlarge",
      numberOfDisks: 2,
      onlyFor: [ODF_WORKLOAD_NAME],
      label: "worker-us",
    };
    dispatch(addMachineSet(machineSet));
    expect(
      !!store.getState().machineSet.find((ms) => ms.name === machineSet.name)
    ).toBeTruthy();
  });
  it("Should schedule ODF internal workload", () => {
    dispatch(addServices(odfServices));
    dispatch(addWorkload(odfWorkload));
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
  it("Should edit internal ODF workload to external", () => {
    dispatch(editServices(odfExternalServices));
    dispatch(editWorkload(odfExternalWorkload));
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
  it("Should edit external ODF workload to compact", () => {
    dispatch(editServices(odfCompactServices));
    dispatch(editWorkload(odfCompactWorkload));
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
