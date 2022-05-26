import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionGroup,
  Button,
  Form,
  TextContent,
  TextVariants,
  Title,
  Text,
  Split,
  SplitItem,
  FlexItem,
  Flex,
} from "@patternfly/react-core";
import DiskSize from "./DiskSize";
import { getODFWorkload } from "../../workloads";
import {
  addWorkload,
  addServices,
  setTab,
  Store,
  addMachineSet,
} from "../../redux";
import "./planner.css";
import {
  getWorkloadFromDescriptors,
  isWorkloadSchedulable,
  removeWorkloadSafely,
} from "../../utils/workload";
import { defaultODFInstances } from "../../cloudInstance";
import { MachineSet } from "../../types";
import CapacityChart from "../Generic/Capacity";
import {
  customEventPusher,
  useGetAnalyticClientID,
  STORAGE_CREATE,
} from "../../analytics";

const StoragePage: React.FC = () => {
  const {
    ocsState,
    workloads,
    services: existingServices,
    machineSet,
    platform,
    totalCapacity,
  } = useSelector((store: Store) => ({
    ocsState: store.ocs,
    workloads: store.workload,
    services: store.service.services,
    machineSet: store.machineSet,
    platform: store.cluster.platform,
    totalCapacity: store.ocs.usableCapacity,
  }));
  const dispatch = useDispatch();

  const totalStorage = React.useMemo(
    () =>
      workloads.reduce(
        (acc, curr) => (acc += (curr.storageCapacityRequired || 0) / 1000),
        0
      ),
    [JSON.stringify(workloads)]
  );

  const clientID = useGetAnalyticClientID();

  const onClick = () => {
    const odfWorkload = getODFWorkload(
      ocsState.usableCapacity,
      ocsState.flashSize,
      ocsState.deploymentType,
      ocsState.dedicatedMachines
    );

    // Remove existing ODF Workload if already present
    const oldWorkload = workloads.find((wl) => wl.name.includes("ODF"));
    if (oldWorkload) {
      removeWorkloadSafely(dispatch)(oldWorkload, existingServices);
    }

    const { services, workload } = getWorkloadFromDescriptors(odfWorkload);
    const workloadScheduleChecker = isWorkloadSchedulable(services, machineSet);
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

    dispatch(addServices(services));
    dispatch(addWorkload(workload));
    // Redirect users to Results Page
    dispatch(setTab(3));

    if (clientID) {
      const params = {
        usableCapacity: `${ocsState.usableCapacity}`,
        // deploymentType: ocsState.deploymentType
      };
      customEventPusher(STORAGE_CREATE, params, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
  };

  return (
    <div className="page--margin">
      <Split>
        <SplitItem>
          <Title headingLevel="h1">Configure ODF Storage</Title>
          <TextContent>
            <Text component={TextVariants.p}>
              Use this section to configure storage for your cluster. You can
              create a ODF Storage Cluster. This Storage can be consumed by your
              other workloads.
            </Text>
          </TextContent>
          <Form className="create-form--margin">
            <DiskSize />
            <ActionGroup>
              <Button variant="primary" onClick={onClick}>
                Create
              </Button>
            </ActionGroup>
          </Form>
        </SplitItem>
        <SplitItem>
          <Flex
            direction={{ default: "column" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              Total Capacity requested by workloads = {totalStorage.toFixed(2)}{" "}
              TB
            </FlexItem>
            <FlexItem>
              <CapacityChart
                title="ODF usage"
                usedCapacity={Math.round(totalStorage)}
                totalCapacity={totalCapacity}
                description="Shows the ODF Cluster Usage"
              />
            </FlexItem>
          </Flex>
        </SplitItem>
      </Split>
    </div>
  );
};

export default StoragePage;
