import * as React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
  NumberInput,
} from "@patternfly/react-core";
import { CaretDownIcon, WarningTriangleIcon } from "@patternfly/react-icons";
import { Action, Payload, Platform, State } from "../../types";
import "./planner.css";

type PlanningGenericProps = {
  dispatch: React.Dispatch<{ type: Action; payload: Payload }>;
  state: State;
  className?: string;
  isTour?: boolean;
};

const stateToParamsMap: { [key: string]: string } = {
  platform: "p",
  nodeCPU: "nc",
  nodeMemory: "nm",
  flashSize: "fs",
  usableCapacity: "uc",
  deploymentType: "dt",
  nvmeTuning: "nt",
  cephFSActive: "ca",
  nooBaaActive: "na",
  rgwActive: "ra",
};

const stateToActionMap: { [key: string]: Action } = {
  platform: Action.setPlatform,
  nodeCPU: Action.setNodeCPU,
  nodeMemory: Action.setNodeMemory,
  flashSize: Action.setFlashSize,
  usableCapacity: Action.setUsableCapacity,
  deploymentType: Action.setDeploymentType,
  nvmeTuning: Action.setNVMeTuning,
  cephFSActive: Action.setCephFSActive,
  nooBaaActive: Action.setNooBaaActive,
  rgwActive: Action.setRGWActive,
};

const urlDataSanitizer = (param: string, data: any) => {
  if (
    ["nooBaaActive", "cephFSActive", "rgwActive", "nvmeTuning"].includes(param)
  ) {
    return data === "true";
  }
  if (
    ["nodeCPU", "nodeMemory", "flashSize", "usableCapacity"].includes(param)
  ) {
    return Number(data);
  }
  return data;
};

const mapStateToURL = (state: State): void => {
  const url = new URLSearchParams(window.location.search);
  Object.entries(state).forEach(([key, val]) => {
    url.set(stateToParamsMap[key], val as string);
  });
  window.history.replaceState(
    {},
    "",
    `${window.location.href?.split("?")[0]}?${url.toString()}`
  );
};

const mapURLToState = (dispatch: PlanningGenericProps["dispatch"]): void => {
  const url = new URLSearchParams(window.location.hash.split("#/?")?.[1]);
  Object.entries(stateToParamsMap).forEach(([key, val]) => {
    if (url.has(val)) {
      dispatch({
        type: stateToActionMap[key],
        payload: urlDataSanitizer(key, url.get(val)) as Payload,
      });
    }
  });
};

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

const nodeCpuCountItems = [
  <DropdownItem key="8" id="8">
    8
  </DropdownItem>,
  <DropdownItem key="16" id="16">
    16
  </DropdownItem>,
  <DropdownItem key="32" id="32">
    32
  </DropdownItem>,
  <DropdownItem key="48" id="48">
    48
  </DropdownItem>,
];

const nodeMemoryItems = [
  <DropdownItem key="8" id="8">
    8
  </DropdownItem>,
  <DropdownItem key="16" id="16">
    16
  </DropdownItem>,
  <DropdownItem key="32" id="32">
    32
  </DropdownItem>,
  <DropdownItem key="64" id="64">
    64
  </DropdownItem>,
  <DropdownItem key="96" id="96">
    96
  </DropdownItem>,
  <DropdownItem key="128" id="128">
    128
  </DropdownItem>,
];

const Planner: React.FC<PlanningGenericProps> = (props) => {
  const { dispatch, state, isTour = true } = props;
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const prevValue = React.useRef<boolean>();

  const isUPI = [Platform.RHV, Platform.BAREMETAL, Platform.VMware].includes(
    state.platform
  );

  React.useEffect(() => {
    mapURLToState(dispatch);
  }, []);

  React.useEffect(() => {
    // Update the state from URL once the tour Completes
    if (prevValue.current === true && isTour === false) {
      mapURLToState(dispatch);
    }
    // Update the state only if we are out of tour and the state is updates from the URL
    if (!isTour && prevValue.current === false) {
      mapStateToURL(state);
    }
    prevValue.current = isTour;
  }, [JSON.stringify(state), isTour]);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    const platform = event?.currentTarget?.id as Platform;
    setDropdownOpen((open) => !open);
    dispatch({ type: Action.setPlatform, payload: platform });
    // If more of such conditionals are required then move out this code
    if (platform === Platform.AWSi3) {
      dispatch({ type: Action.setFlashSize, payload: 2.5 });
    }
  };

  const isPlatformTechPreview = React.useMemo(
    () =>
      [Platform.RHV, Platform.AZURE, Platform.GCP, Platform.AWSi3].includes(
        state.platform
      )
        ? "error"
        : "default",
    [state.platform]
  );

  return (
    <Form className="planner-form">
      <FormGroup
        fieldId="dropdown-paltform"
        label="Platform"
        validated={isPlatformTechPreview}
        helperTextInvalid={`${state.platform} is currently in tech-preview.`}
        helperTextInvalidIcon={<WarningTriangleIcon />}
      >
        <Dropdown
          isOpen={dropdownOpen}
          onSelect={onSelect}
          toggle={
            <DropdownToggle
              onToggle={() => setDropdownOpen((open) => !open)}
              toggleIndicator={CaretDownIcon}
            >
              {state.platform}
            </DropdownToggle>
          }
          dropdownItems={platformDropdownItems}
          id="dropdown-platform"
          className="planner-form__dropdown"
        />
      </FormGroup>
      {isUPI && <UpiPlatform state={state} dispatch={dispatch} />}
      <DiskSize state={state} dispatch={dispatch} />
    </Form>
  );
};

const UpiPlatform: React.FC<PlanningGenericProps> = (props) => {
  const { dispatch, state } = props;
  const [isCpuOpen, setCpuOpen] = React.useState(false);
  const [isMemOpen, setMemOpen] = React.useState(false);

  const onSelect = (dropdown: string) => (
    event?: React.SyntheticEvent<HTMLDivElement>
  ) => {
    const type =
      dropdown === "NodeCPU" ? Action.setNodeCPU : Action.setNodeMemory;
    if (dropdown === "NodeCPU") {
      setCpuOpen(false);
    } else {
      setMemOpen(false);
    }
    const amount = event?.currentTarget?.id;
    dispatch({ type, payload: amount as Payload });
  };

  return (
    <>
      <FormGroup label="Node CPU unit count" fieldId="cpu-dropdown">
        <Dropdown
          id="cpu-dropdown"
          className="planner-form__dropdown"
          isOpen={isCpuOpen}
          toggle={
            <DropdownToggle
              onToggle={() => setCpuOpen((open) => !open)}
              toggleIndicator={CaretDownIcon}
            >
              {state.nodeCPU}
            </DropdownToggle>
          }
          dropdownItems={nodeCpuCountItems}
          onSelect={onSelect("NodeCPU")}
        />
      </FormGroup>
      <FormGroup label="Node Memory unit count" fieldId="memory-dropdown">
        <Dropdown
          className="planner-form__dropdown"
          id="memory-dropdown"
          isOpen={isMemOpen}
          toggle={
            <DropdownToggle
              onToggle={() => setMemOpen((open) => !open)}
              toggleIndicator={CaretDownIcon}
            >
              {state.nodeMemory}
            </DropdownToggle>
          }
          dropdownItems={nodeMemoryItems}
          onSelect={onSelect("NodeMemory")}
        />
      </FormGroup>
    </>
  );
};

const DiskSize: React.FC<PlanningGenericProps> = ({ state, dispatch }) => {
  const disableDiskSize = state.platform === Platform.AWSi3;

  const setSize = (
    inputType: "Button" | "User",
    type: Action.setFlashSize | Action.setUsableCapacity
  ) => (...args: any) => {
    const maxValue = type === Action.setFlashSize ? 16 : 1000;
    const value =
      type === Action.setFlashSize ? state.flashSize : state.usableCapacity;
    const incrementValue = type === Action.setFlashSize ? 0.1 : 0.5;
    if (inputType === "Button") {
      if (args[0] === "Increment") {
        dispatch({ type, payload: +(value + incrementValue).toFixed(1) });
      } else if (args[0] === "Decrement" && state.flashSize) {
        dispatch({ type, payload: +(value - incrementValue).toFixed(1) });
      }
    }
    if (inputType === "User") {
      const inputValue = Number(args[0].currentTarget.value);
      if (inputValue <= maxValue) {
        dispatch({ type, payload: inputValue });
      }
    }
  };

  const isDiskSizeTechPreview = React.useMemo(
    () => (state.flashSize >= 4.0 ? "error" : "default"),
    [state.flashSize]
  );

  return (
    <>
      <FormGroup
        label="Flash Disk Size (TB)"
        fieldId="flash-input"
        validated={isDiskSizeTechPreview}
        helperTextInvalid="Disks greater than 4TB is not tested and is still a tech preview feature."
        helperTextInvalidIcon={<WarningTriangleIcon />}
      >
        <NumberInput
          value={state.flashSize}
          min={0}
          max={16}
          onMinus={() => setSize("Button", Action.setFlashSize)("Decrement")}
          onPlus={() => setSize("Button", Action.setFlashSize)("Increment")}
          onChange={setSize("User", Action.setFlashSize)}
          inputName="diskSize"
          inputAriaLabel="Disk Size"
          unit="TB"
          id="flash-input"
          isDisabled={disableDiskSize}
        />
      </FormGroup>
      <FormGroup label="Usable Capacity Required (TB)" fieldId="usable-input">
        <NumberInput
          value={state.usableCapacity}
          min={0}
          max={1000}
          onMinus={() =>
            setSize("Button", Action.setUsableCapacity)("Decrement")
          }
          onPlus={() =>
            setSize("Button", Action.setUsableCapacity)("Increment")
          }
          onChange={setSize("User", Action.setUsableCapacity)}
          inputName="diskSize"
          inputAriaLabel="Disk Size"
          unit="TB"
          id="usable-input"
        />
      </FormGroup>
    </>
  );
};

export default Planner;
