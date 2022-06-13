import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getODFWorkload } from "../workloads";
import {
  getWorkloadFromDescriptors,
  isWorkloadSchedulable,
} from "../utils/workload";
import { addMachineSet, addServices, addWorkload, Store } from "../redux";
import { defaultODFInstances } from "../cloudInstance";
import { ODF_DEDICATED_MS_NAME, ODF_WORKLOAD_NAME } from "../constants";

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
  const isODFPresent = !!workloads.find(
    (workload) => workload.name === ODF_WORKLOAD_NAME
  );
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
          name: ODF_DEDICATED_MS_NAME,
          cpu: instance.cpuUnits,
          memory: instance.memory,
          instanceName: instance.name,
          numberOfDisks: instance.maxDisks,
          instanceStorage: instance.instanceStorage,
          onlyFor: [ODF_WORKLOAD_NAME],
          label: ODF_DEDICATED_MS_NAME,
        })
      );
    }
  }, [
    ocs.usableCapacity,
    ocs.flashSize,
    ocs.deploymentType,
    ocs.dedicatedMachines,
    dispatch,
    allServices,
    machineSets,
    platform,
  ]);
  return [isODFPresent, createODFWorkload];
};

// [isODFPresent, usedStorage, totalStorage]
type UseStorageDetails = () => [boolean, number, number];

export const useStorageDetails: UseStorageDetails = () => {
  const { workloads, clusterSize } = useSelector((store: Store) => ({
    workloads: store.workload,
    clusterSize: store.ocs.usableCapacity,
  }));

  const [isODFPresent, totalStorageRequested] = React.useMemo(() => {
    const isODFPresent = !!workloads.find((wl) =>
      wl.name.includes(ODF_WORKLOAD_NAME)
    );

    const totalStorageRequested = workloads.reduce(
      (acc, curr) => (acc += (curr.storageCapacityRequired || 0) / 1000),
      0
    );
    return [isODFPresent, totalStorageRequested];
  }, [workloads]);
  return [isODFPresent, totalStorageRequested, clusterSize];
};
