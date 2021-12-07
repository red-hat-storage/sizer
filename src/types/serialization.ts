import { Store } from "../redux";
import { WorkloadDescriptor } from "./Workload";

// The minimum state that needs to be shared to reproduce cluster config
export type MinimalState = {
  workload: WorkloadDescriptor[];
  ocs: Store["ocs"];
  machineSet: Store["machineSet"];
  platform: Store["cluster"]["platform"];
};
