import {
  TextContent,
  TextVariants,
  Title,
  Text,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import CreateCard from "../Generic/CreateCard";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModalAction, Store } from "../../redux";
import WorkloadCreate, { WL_MODAL_ID } from "./WorkloadCreate";
import { ClusterIcon } from "@patternfly/react-icons";
import WorkloadCard from "./WorkloadCard";

const WorkloadPage: React.FC = () => {
  const dispatch = useDispatch();
  const openCreateModal = () => dispatch(openModalAction(WL_MODAL_ID));
  const workloads = useSelector((store: Store) => store.workload);

  return (
    <div className="page--margin">
      <WorkloadCreate />
      <div className="create-form--margin">
        <Title headingLevel="h1">Configure Workloads</Title>
        <TextContent>
          <Text component={TextVariants.p}>
            Use this section to configure Workloads. These Workloads will be run
            in the Cluster.
          </Text>
        </TextContent>
      </div>
      <Grid hasGutter>
        <GridItem rowSpan={2} span={3}>
          <CreateCard
            onClick={openCreateModal}
            Icon={ClusterIcon}
            type="Workload"
          />
        </GridItem>
        {workloads
          .filter((wl) => wl.duplicateOf === undefined)
          .map((wl) => (
            <GridItem key={wl.name} rowSpan={2} span={3}>
              <WorkloadCard workload={wl} />
            </GridItem>
          ))}
      </Grid>
    </div>
  );
};

export default WorkloadPage;
