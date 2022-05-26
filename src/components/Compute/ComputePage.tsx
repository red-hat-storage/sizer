import * as React from "react";
import CreateCard from "../Generic/CreateCard";
import MachineSetCreate, { CM_MODAL_ID } from "./MachineSetCreate";
import { useDispatch, useSelector } from "react-redux";
import { openModalAction, Store } from "../../redux";
import { ServerIcon } from "@patternfly/react-icons";
import {
  Grid,
  GridItem,
  TextContent,
  TextVariants,
  Title,
  Text,
  Form,
} from "@patternfly/react-core";
import MachineSetCard from "./MachineSetCard";
import PlatformSelector from "../Common/PlatformSelector";
import "./compute.css";

const isDeletable = (machineName: string) =>
  machineName !== "controlPlane" && machineName !== "default";

const Compute: React.FC = () => {
  const dispatch = useDispatch();
  const openCreateModal = React.useCallback(() => {
    dispatch(openModalAction(CM_MODAL_ID));
  }, []);

  const machines = useSelector((store: Store) => store.machineSet);

  return (
    <div className="page--margin">
      <Title headingLevel="h1">Configure MachineSets</Title>
      <TextContent>
        <Text component={TextVariants.p}>
          Use this section to configure MachineSets. These MachineSets will be
          used by workloads. A default MachineSet will be created for a
          particular Platform.
        </Text>
      </TextContent>
      <Form className="create-form--margin">
        <PlatformSelector />
      </Form>
      <MachineSetCreate />
      <Grid hasGutter>
        <GridItem rowSpan={2} span={3}>
          <CreateCard
            onClick={openCreateModal}
            Icon={ServerIcon}
            type="MachineSet"
          />
        </GridItem>
        {machines.map((machine) => (
          <GridItem rowSpan={2} span={3} key={machine.name}>
            <MachineSetCard
              machineSet={machine}
              disableActions={!isDeletable(machine.name)}
            />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Compute;
