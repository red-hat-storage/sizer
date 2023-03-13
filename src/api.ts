import * as _ from "lodash";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { node } from "webpack";
import { defaultODFInstances } from "./cloudInstance";
import { ODF_DEDICATED_MS_NAME, ODF_WORKLOAD_NAME } from "./constants";
import {
  addMachineSet,
  addServices,
  addWorkload,
  removeAllNodes,
  removeAllZones,
  store,
  Store,
  updateMachineSet,
} from "./redux";
import { workloadScheduler } from "./scheduler/workloadScheduler";
import {
  DeploymentType,
  MachineSet,
  Platform,
  Workload,
  Zone,
  Node,
} from "./types";
import {
  getWorkloadFromDescriptors,
  isCloudPlatform,
  isWorkloadSchedulable,
  removeWorkloadSafely,
} from "./utils";
import { getODFWorkload } from "./workloads";

export const useSetupAPI = (): void => {
  const {
    workloads,
    services: existingServices,
    machineSet,
    nodes,
  } = useSelector((store: Store) => ({
    workloads: store.workload,
    services: store.service.services,
    machineSet: store.machineSet,
    nodes: store.node.nodes,
  }));

  const dispatch = useDispatch();
  const [useDedicated, setDedicated] = React.useState(() =>
    machineSet.find((ms) => ms.onlyFor.includes(ODF_WORKLOAD_NAME))
      ? true
      : false
  );
  const [dedicatedMSName, setDedicatedMSName] = React.useState(
    () =>
      machineSet.find((ms) => ms.onlyFor.includes(ODF_WORKLOAD_NAME))?.name ??
      null
  );

  React.useEffect(() => {
    // Dedicated MachineSet for ODF
    const hasDedicatedMS = machineSet.find(
      (ms) => ms.name === ODF_DEDICATED_MS_NAME
    );
    if (hasDedicatedMS) {
      if (!dedicatedMSName) {
        setDedicatedMSName(ODF_DEDICATED_MS_NAME);
        setDedicated(true);
      }
    }
  }, [machineSet, setDedicatedMSName, setDedicated, dedicatedMSName]);

  const createODFWorkload = React.useCallback(
    (
      usableCapacity: number,
      flashSize: number,
      deploymentType: DeploymentType,
      platform: Platform,
      dedicatedMachines: string[]
    ) => {
      const odfWorkload = getODFWorkload(
        usableCapacity,
        flashSize,
        deploymentType,
        dedicatedMachines,
        true,
        !isCloudPlatform(platform) // Enables RGW only for UPI deployments
      );

      // Remove existing ODF Workload if already present
      const oldWorkload = workloads.find((wl) =>
        wl.name.includes(ODF_WORKLOAD_NAME)
      );
      if (oldWorkload) {
        removeWorkloadSafely(dispatch)(oldWorkload, existingServices);
      }

      const { services, workload } = getWorkloadFromDescriptors(odfWorkload);

      // If the user does not care about the machineset
      if (!useDedicated) {
        const workloadScheduleChecker = isWorkloadSchedulable(
          services,
          machineSet
        );
        const [isSchedulable] = workloadScheduleChecker(workload);
        if (!isSchedulable) {
          const odfInstance = defaultODFInstances[platform];
          const odfMS: MachineSet = {
            name: "storage",
            cpu: odfInstance.cpuUnits,
            memory: odfInstance.memory,
            instanceName: odfInstance.name,
            onlyFor: [workload.name],
            numberOfDisks: 24,
            label: "ODF Node",
          };
          dispatch(addMachineSet(odfMS));
        }
      } else {
        const selectedMS = machineSet.find((ms) => ms.name === dedicatedMSName);
        workload.usesMachines = [selectedMS.name];
        if (selectedMS.onlyFor.length === 0) {
          const updatedSelectedMS = Object.assign(_.cloneDeep(selectedMS), {
            onlyFor: [odfWorkload.name],
          });
          dispatch(updateMachineSet(updatedSelectedMS));
        }
      }
      dispatch(addServices(services));
      dispatch(addWorkload(workload));
    },
    [
      workloads,
      useDedicated,
      dispatch,
      existingServices,
      machineSet,
      dedicatedMSName,
    ]
  );

  const { machineSets, services } = useSelector((store: Store) => ({
    ocsState: store.ocs,
    workloads: store.workload,
    machineSets: store.machineSet,
    platform: store.cluster.platform,
    allNodes: store.node.nodes,
    zones: store.zone.zones,
    services: store.service.services,
  }));

  const schedule = React.useCallback(() => {
    dispatch(removeAllZones());
    dispatch(removeAllNodes());
    const unschedulables = [];
    const scheduler = workloadScheduler(store, dispatch);
    const checkSchedulability = isWorkloadSchedulable(services, machineSets);
    const workloadSchedulability: [Workload, boolean, MachineSet[]][] =
      workloads.map((wl) => [wl, ...checkSchedulability(wl)]);
    const usedZonesId: number[] = [];
    workloadSchedulability.forEach((item) => {
      if (item[1]) {
        // Schedule on MachineSets that can run it
        scheduler(item[0], services, item[2], usedZonesId);
      } else {
        unschedulables.push(item[0]);
      }
    });
  }, [dispatch, machineSets, services, workloads]);

  const zones: Zone[] = useSelector((store: Store) => store.zone.zones);

  const showLayout = React.useCallback(() => {
    schedule();
    const zoneNodeMap = zones.reduce((acc, curr) => {
      acc[curr.id] = nodes.filter((node) => curr.nodes.includes(node.id));
      let currNodes = _.cloneDeep(acc[curr.id]);
      currNodes = currNodes.map((node) => {
        node.services = node.services.map((ser) =>
          services.find((s) => s.id === ser)
        ) as any;
        return node;
      });
      acc[curr.id] = currNodes;
      return acc;
    }, {} as { [key: number]: Node[] });
    console.log(zoneNodeMap);
  }, [nodes, schedule, services, zones]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.createStorageCluster = createODFWorkload;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.schedule = schedule;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.showLayout = showLayout;
  }, [createODFWorkload, schedule, showLayout]);
};
