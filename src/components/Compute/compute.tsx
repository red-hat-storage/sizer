import * as React from "react";
import CreateCard from "../Generic/CreateCard";
import MachineSetCreate, { CM_MODAL_ID } from "./MachineSetCreate";
import { useDispatch, useSelector } from "react-redux";
import {
  addMachineSet,
  openModalAction,
  clearAllMachines,
  setPlatform,
  Store,
} from "../../redux";
import { CaretDownIcon, ServerIcon } from "@patternfly/react-icons";
import {
  Grid,
  GridItem,
  TextContent,
  TextVariants,
  Title,
  Text,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
} from "@patternfly/react-core";
import MachineSetCard from "./MachineSetCard";
import { Platform } from "../../types";
import "./compute.css";
import { defaultInstances } from "../../cloudInstance";
import { MachineSet } from "../../models";

const platformDropdownItems = [
  <DropdownItem key="BareMetal" id="BareMetal">
    BareMetal
  </DropdownItem>,
  <DropdownItem key="AWS" id="AWS">
    AWS
  </DropdownItem>,
  <DropdownItem key="GCP" id="GCP">
    GCP
  </DropdownItem>,
  <DropdownItem key="Azure" id="AZURE">
    Azure
  </DropdownItem>,
  <DropdownItem key="VMware" id="VMware">
    VMs in VMware
  </DropdownItem>,
  <DropdownItem key="RHV" id="RHV">
    VMs in RHV and OpenStack
  </DropdownItem>,
];

const Compute: React.FC = () => {
  const dispatch = useDispatch();
  const [isPlatformDropdownOpen, setPlatformDropdownOpen] = React.useState(
    false
  );

  const openCreateModal = React.useCallback(() => {
    dispatch(openModalAction(CM_MODAL_ID));
  }, []);

  const machines = useSelector((store: Store) => store.machineSet);
  const platform = useSelector((store: Store) => store.cluster.platform);

  const onSelect = (platform: Platform) => {
    dispatch(setPlatform(platform));
    dispatch(clearAllMachines());
    const instance = defaultInstances[platform];
    const defaultMachineSet: MachineSet = {
      name: "default",
      cpu: instance.cpuUnits,
      memory: instance.memory,
      instanceName: instance.name,
      onlyFor: [],
      numberOfDisks: 24,
    };
    dispatch(addMachineSet(defaultMachineSet));
    setPlatformDropdownOpen(false);
  };

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
        <FormGroup fieldId="dropdown-paltform" label="Platform">
          <Dropdown
            isOpen={isPlatformDropdownOpen}
            onSelect={(event) => onSelect(event?.currentTarget.id as Platform)}
            toggle={
              <DropdownToggle
                onToggle={() => setPlatformDropdownOpen((open) => !open)}
                toggleIndicator={CaretDownIcon}
              >
                {platform}
              </DropdownToggle>
            }
            dropdownItems={platformDropdownItems}
            id="dropdown-platform"
            className="planner-form__dropdown"
          />
        </FormGroup>
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
              disableDeletion={machines.length === 1}
            />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Compute;