import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getODFWorkload } from "../workloads";
import {
  getWorkloadFromDescriptors,
  isWorkloadSchedulable,
} from "../utils/workload";
import { addMachineSet, addServices, addWorkload, Store } from "../redux";
import { defaultODFInstances } from "../cloudInstance";

// [isODFPresent, createODFWorkload]
type UseODFPresent = () => [boolean, () => void];

export const useODFPresent: UseODFPresent = () => {
  const { workloads, machineSets, allServices, platform } = useSelector(
    (store: Store) => ({
      workloads: store.workload,
      machineSets: store.machineSet,
      allServices: store.service.services,
      platform: store.cluster.platform,
    })
  );
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
    const workloadScheduler = isWorkloadSchedulable(
      // Store is not updated yet so manually add thsee services to the list
      [...allServices, ...services],
      machineSets
    );
    const [isSchedulable, ,] = workloadScheduler(workload);
    if (!isSchedulable) {
      const instance = defaultODFInstances[platform];
      dispatch(
        addMachineSet({
          name: "odf-default",
          cpu: instance.cpuUnits,
          memory: instance.memory,
          instanceName: instance.name,
          numberOfDisks: instance.instanceStorage,
          onlyFor: ["ODF"],
          label: "odf-default",
        })
      );
    }
  }, [dispatch, workloads, machineSets, allServices, platform]);
  return [isODFPresent, createODFWorkload];
};
