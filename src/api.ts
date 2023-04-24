import * as _ from "lodash";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  controlPlaneInstances,
  defaultInstances,
  defaultODFInstances,
  platformInstanceMap,
} from "./cloudInstance";
import { getRandomName } from "./components/Compute/RandomComputeName";
import { ODF_DEDICATED_MS_NAME, ODF_WORKLOAD_NAME } from "./constants";
import {
  addMachineSet,
  addServices,
  addWorkload,
  clearAllMachines,
  removeAllNodes,
  removeAllZones,
  setPlatform,
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
  Instance,
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
    platform,
  } = useSelector((store: Store) => ({
    workloads: store.workload,
    services: store.service.services,
    machineSet: store.machineSet,
    nodes: store.node.nodes,
    platform: store.cluster.platform,
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
    return zoneNodeMap;
  }, [nodes, services, zones]);

  const createMachineSet = React.useCallback(
    (
      machineSetName: string,
      instanceName?: string,
      cpu?: number,
      memory?: number,
      dedicateToODF?: boolean
    ) => {
      const instance = _.find<Instance>(
        platformInstanceMap[platform],
        (item) => item.name === instanceName
      );
      const isCloud = isCloudPlatform(platform);
      const machineSet = {
        name: machineSetName,
        cpu: !isCloud ? cpu : instance?.cpuUnits,
        memory: !isCloud ? memory : instance?.memory,
        instanceName: isCloud ? instance?.name : getRandomName(),
        numberOfDisks: isCloud ? instance.maxDisks : 24,
        onlyFor: dedicateToODF ? [ODF_WORKLOAD_NAME] : [],
        label: "Worker Node",
        instanceStorage: instance?.instanceStorage,
      };
      dispatch(addMachineSet(machineSet));
    },
    [dispatch, platform]
  );

  const changePlatform = React.useCallback(
    (platform: Platform) => {
      dispatch(setPlatform(platform));
      dispatch(removeAllNodes());
      dispatch(clearAllMachines());
      const workerInstance = defaultInstances[platform];
      const defaultMachineSet: MachineSet = {
        name: "default",
        cpu: workerInstance.cpuUnits,
        memory: workerInstance.memory,
        instanceName: workerInstance.name,
        onlyFor: [],
        numberOfDisks: 24,
        label: "Worker Node",
      };
      dispatch(addMachineSet(defaultMachineSet));
      const controlInstance = controlPlaneInstances[platform];
      const controlPlaneMachineSet: MachineSet = {
        name: "controlPlane",
        cpu: controlInstance.cpuUnits,
        memory: controlInstance.memory,
        instanceName: controlInstance.name,
        onlyFor: ["ControlPlane"],
        numberOfDisks: 24,
        label: "Control Plane Node",
      };
      dispatch(addMachineSet(controlPlaneMachineSet));
    },
    [dispatch]
  );

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.createMachineSet = createMachineSet;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.changePlatform = changePlatform;
  }, [
    createODFWorkload,
    schedule,
    showLayout,
    createMachineSet,
    changePlatform,
  ]);
};
