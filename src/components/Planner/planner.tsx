import * as React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
  Slider,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { Action, Payload, Platform, State } from "../../types";
import "./planner.css";

type PlanningGenericProps = {
  dispatch: React.Dispatch<{ type: Action; payload: Payload }>;
  state: State;
  className?: string;
  isUPI?: boolean;
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
  return data;
};

const mapStateToURL = (state: State): void => {
  const url = new URLSearchParams(window.location.search);
  Object.entries(state).forEach(([key, val]) => {
    url.set(stateToParamsMap[key], val as string);
  });
  window.history.replaceState({}, "", `?${url.toString()}`);
};

const mapURLToState = (dispatch: PlanningGenericProps["dispatch"]): void => {
  const url = new URLSearchParams(window.location.search);
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

const flashSizeSteps = (() => {
  const steps = [];
  for (let i = 0; i <= 16; i += 0.1) {
    steps.push(i);
  }
  return steps.map((step, i) => ({
    value: +((i / 160) * 100).toFixed(2),
    label: step.toFixed(1),
    isLabelHidden: true,
  }));
})();

const Planner: React.FC<PlanningGenericProps> = (props) => {
  const { dispatch, state, isTour = false } = props;
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const isUPI = [Platform.RHV, Platform.BAREMETAL, Platform.VMware].includes(
    state.platform
  );

  React.useEffect(() => {
    if (!isTour) {
      mapURLToState(dispatch);
      mapStateToURL(state);
    }
  }, [isTour]);

  React.useEffect(() => {
    if (!isTour) {
      mapStateToURL(state);
    }
  }, [JSON.stringify(state), isTour]);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    const platform = event?.currentTarget?.id as Platform;
    setDropdownOpen((open) => !open);
    dispatch({ type: Action.setPlatform, payload: platform });
  };

  return (
    <Form className="planner-form">
      <FormGroup fieldId="dropdown-paltform" label="Platform">
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
      <DiskSize state={state} dispatch={dispatch} isUPI={isUPI} />
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

const DiskSize: React.FC<PlanningGenericProps> = ({
  state,
  dispatch,
  isUPI,
}) => {
  const [flashSlider, setFlashSlider] = React.useState(0);
  const [flashInputValue, setFlashInputValue] = React.useState("0");
  const setValue = (inputSource: string) => (value: number) => {
    const type =
      inputSource === "FlashSize"
        ? Action.setFlashSize
        : Action.setUsableCapacity;
    if (inputSource === "FlashSize") {
      const selecetedVal = flashSizeSteps.find((step) => step.value === value);
      setFlashSlider(selecetedVal?.value || 0);
      dispatch({
        type,
        payload: selecetedVal?.label as Payload,
      });
      setFlashInputValue(selecetedVal?.label as string);
    } else {
      dispatch({
        type,
        payload: +(value * 10).toFixed(0),
      });
    }
  };
  const { usableCapacity } = state;
  return (
    <>
      {isUPI && (
        <FormGroup label="Flash Disk Size (TB)" fieldId="flash-slider">
          <Slider
            className="slider__flash"
            currentValue={flashSlider}
            onValueChange={setValue("FlashSize")}
            isInputVisible
            inputValue={+flashInputValue}
            isInputDisabled={true}
            inputLabel="TB"
            isDiscrete
            steps={flashSizeSteps}
            id="flash-slider"
          />
        </FormGroup>
      )}
      <FormGroup label="Usable Capacity Required (TB)" fieldId="usable-slider">
        <Slider
          className="slider__usable"
          currentValue={usableCapacity / 10}
          onValueChange={setValue("Usable")}
          isInputVisible
          inputValue={usableCapacity}
          inputLabel="TB"
          isInputDisabled
          id="usable-slider"
        />
      </FormGroup>
    </>
  );
};

export default Planner;
