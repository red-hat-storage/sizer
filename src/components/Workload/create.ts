import { Dispatch } from "@reduxjs/toolkit";
import { addServices, addWorkload } from "../../redux";
import { WorkloadDescriptor } from "../../types";
import { getWorkloadFromDescriptors } from "../../utils/workload";
import { createDuplicates } from "./util";

export const createWorkload = (dispatch: Dispatch) => (
  workloadObject: WorkloadDescriptor
): void => {
  const { services, workload } = getWorkloadFromDescriptors(workloadObject);
  dispatch(addServices(services));
  dispatch(addWorkload(workload));
  const workloadDescriptors = createDuplicates(workloadObject, workload.id);
  workloadDescriptors.forEach((wld) => {
    const {
      services: serviceDup,
      workload: workloadDup,
    } = getWorkloadFromDescriptors(wld);
    dispatch(addServices(serviceDup));
    dispatch(addWorkload(workloadDup));
  });
};
