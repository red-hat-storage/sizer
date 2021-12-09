import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getODFWorkload } from "../workloads";
import { getWorkloadFromDescriptors } from "../utils/workload";
import { addServices, addWorkload, Store } from "../redux";

// [isODFPresent, createODFWorkload]
type UseODFPresent = () => [boolean, () => void];

export const useODFPresent: UseODFPresent = () => {
  const workloads = useSelector((store: Store) => store.workload);
  const ocs = useSelector((store: Store) => store.ocs);
  const dispatch = useDispatch();
  const isODFPresent = !!workloads.find((workload) => workload.name === "ODF");
  const createODFWorkload = React.useCallback(() => {
    const odfWorkload = getODFWorkload(
      ocs.usableCapacity,
      ocs.flashSize,
      ocs.deploymentType,
      ocs.dedicatedMachines
    );
    const { services, workload } = getWorkloadFromDescriptors(odfWorkload);
    dispatch(addServices(services));
    dispatch(addWorkload(workload));
  }, [dispatch]);
  return [isODFPresent, createODFWorkload];
};
