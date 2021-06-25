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
import { addWorkload, removeWorkload, setTab, Store } from "../../redux";
import { Disk } from "../../models";
import "./planner.css";

const StoragePage: React.FC = () => {
  const ocsState = useSelector((store: Store) => store.ocs);
  const dispatch = useDispatch();
  const onClick = () => {
    const odfWorkload = getODFWorkload(
      ocsState.usableCapacity,
      new Disk(ocsState.flashSize),
      ocsState.deploymentType,
      ocsState.dedicatedMachines
    );
    // Todo(bipuladh): Move this logic to reducer
    dispatch(removeWorkload(odfWorkload.name));
    dispatch(addWorkload(odfWorkload));
    dispatch(setTab(1));
  };
  return (
    <Form className="planner-form">
      <Title headingLevel="h1">Configure ODF Storage</Title>
      <TextContent>
        <Text component={TextVariants.p}>
          Use this section to configure storage for your cluster. You can create
          a ODF Storage Cluster. This Storage can be consumed by your other
          workloads.
        </Text>
      </TextContent>
      <DiskSize />
      <ActionGroup>
        <Button variant="primary" onClick={onClick}>
          Create
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default StoragePage;
