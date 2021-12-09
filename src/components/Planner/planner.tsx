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
} from "@patternfly/react-core";
import DiskSize from "./DiskSize";
import { getODFWorkload } from "../../workloads";
import { addWorkload, addServices, setTab, Store } from "../../redux";
import "./planner.css";
import {
  getWorkloadFromDescriptors,
  removeWorkloadSafely,
} from "../../utils/workload";

const StoragePage: React.FC = () => {
  const {
    ocsState,
    workloads,
    services: existingServices,
  } = useSelector((store: Store) => ({
    ocsState: store.ocs,
    workloads: store.workload,
    services: store.service.services,
  }));
  const dispatch = useDispatch();

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
    dispatch(addServices(services));
    dispatch(addWorkload(workload));
    // Redirect users to Results Page
    dispatch(setTab(3));
  };
  return (
    <div className="page--margin">
      <Title headingLevel="h1">Configure ODF Storage</Title>
      <TextContent>
        <Text component={TextVariants.p}>
          Use this section to configure storage for your cluster. You can create
          a ODF Storage Cluster. This Storage can be consumed by your other
          workloads.
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
    </div>
  );
};

export default StoragePage;
