import { WorkloadDescriptor } from "../../src/types";
import { getWorkloadFromDescriptors } from "../../src/utils/workload";
import { store as mainStore } from "../../src/redux/store";
import { addServices, addWorkload } from "../../src/redux/reducers";

const store = mainStore;
const { dispatch } = store;

// runWorkload adds a Workload and its Services to the Cluster and
// calls the scheduler to fit it onto nodes
export const runWorkload = (workload: WorkloadDescriptor): void => {
  const {
    services: testServiceIDs,
    workload: testWorkloadIDs,
  } = getWorkloadFromDescriptors(workload);

  dispatch(addServices(testServiceIDs));
  dispatch(addWorkload(testWorkloadIDs));
};
