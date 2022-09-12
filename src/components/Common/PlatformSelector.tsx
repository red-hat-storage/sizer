import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { controlPlaneInstances, defaultInstances } from "../../cloudInstance";
import {
  addMachineSet,
  clearAllMachines,
  setPlatform,
  Store,
  removeAllNodes,
} from "../../redux";
import { MachineSet, Platform } from "../../types";
import {
  customEventPusher,
  PLATFORM_CHANGE,
  useGetAnalyticClientID,
} from "../../analytics";
import "./platformSelector.css";

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
  <DropdownItem key="IBM" id="IBM">
    IBM
  </DropdownItem>,
  <DropdownItem key="VMware" id="VMware">
    VMs in VMware
  </DropdownItem>,
  <DropdownItem key="RHV" id="RHV">
    VMs in RHV and OpenStack
  </DropdownItem>,
];

const PlatformSelector: React.FC = () => {
  const [isPlatformDropdownOpen, setPlatformDropdownOpen] =
    React.useState(false);

  const platform = useSelector((store: Store) => store.cluster.platform);

  const dispatch = useDispatch();
  const clientID = useGetAnalyticClientID();

  const onSelect = (platform: Platform) => {
    const shouldChangePlatform = confirm(
      "Changing platform will reset Nodes & MachineSets. Are you sure you want to proceed?"
    );
    if (shouldChangePlatform) {
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
      if (clientID) {
        const params = { platform };
        customEventPusher(PLATFORM_CHANGE, params, clientID).catch((err) =>
          console.error("Error sending data to analytics service", err)
        );
      }
    }
    setPlatformDropdownOpen(false);
  };

  return (
    <FormGroup fieldId="platform-selector" label="Platform">
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
        id="platform-selector"
        className="planner-form__dropdown"
      />
    </FormGroup>
  );
};

export default PlatformSelector;
