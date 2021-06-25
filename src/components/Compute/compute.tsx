import * as React from "react";
import CreateCard from "../Generic/CreateCard";
import MachineSetCreate, { CM_MODAL_ID } from "./MachineSetCreate";
import { useDispatch, useSelector } from "react-redux";
import { openModalAction, setPlatform, Store } from "../../redux";
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

const platformDropdownItems = [
  <DropdownItem key="BareMetal" id="BareMetal">
    BareMetal
  </DropdownItem>,
  <DropdownItem key="AWS-i3" id="AWSi3">
    AWS i3en.2xl using local NVMe
  </DropdownItem>,
  <DropdownItem key="AWS-m5" id="AWSm5">
    AWS m5 nodes using EBS
  </DropdownItem>,
  <DropdownItem key="GCP" id="GCP">
    GCP with e2-standard-16 instances
  </DropdownItem>,
  <DropdownItem key="Azure" id="AZURE">
    Azure with D16s_v3 instances
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
  const openCreateModal = () => {
    dispatch(openModalAction(CM_MODAL_ID));
  };

  const machines = useSelector((store: Store) => store.machineSet);
  const platform = useSelector((store: Store) => store.cluster.platform);

  const onSelect = (platform: Platform) => {
    dispatch(setPlatform(platform));
    setPlatOpen(false);
  };

  const [isPlatOpen, setPlatOpen] = React.useState(false);
  return (
    <div className="results-wrapper">
      <Title headingLevel="h1">Configure MachineSets</Title>
      <TextContent>
        <Text component={TextVariants.p}>
          Use this section to configure MachineSets. These MachineSets will be
          used by workloads.
        </Text>
      </TextContent>
      <Form>
        <FormGroup fieldId="dropdown-paltform" label="Platform">
          <Dropdown
            isOpen={isPlatOpen}
            onSelect={(event) => onSelect(event?.currentTarget.id as Platform)}
            toggle={
              <DropdownToggle
                onToggle={() => setPlatOpen((open) => !open)}
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
            <MachineSetCard machineSet={machine} />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Compute;
