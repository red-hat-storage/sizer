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

const disableActions = (workloadName: string) =>
  workloadName === "ControlPlane";

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
        <GridItem
          smRowSpan={12}
          mdRowSpan={12}
          lgRowSpan={3}
          sm={12}
          md={6}
          lg={3}
        >
          <CreateCard
            onClick={openCreateModal}
            Icon={ClusterIcon}
            type="Workload"
          />
        </GridItem>
        {workloads
          .filter((wl) => wl.duplicateOf === undefined)
          .map((wl) => (
            <GridItem
              key={`${wl.id}`}
              smRowSpan={12}
              mdRowSpan={12}
              lgRowSpan={3}
              sm={12}
              md={6}
              lg={3}
            >
              <WorkloadCard
                workload={wl}
                disableActions={disableActions(wl.name)}
              />
            </GridItem>
          ))}
      </Grid>
    </div>
  );
};

export default WorkloadPage;
