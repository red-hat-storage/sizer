import * as React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
} from "@patternfly/react-core";
import { CaretDownIcon, WarningTriangleIcon } from "@patternfly/react-icons";
import { Payload, Platform } from "../../types";
import { TECH_PREV_PLATFORMS } from "../Exception/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeploymentType,
  setFlashSize,
  setNodeCPU,
  setNodeMemory,
  setPlatform,
  setUsableCapacity,
} from "../../redux";
import { ActionCreatorWithPayload, Dispatch } from "@reduxjs/toolkit";
import DiskSize from "./DiskSize";
import UpiPlatform from "./UPIPlatform";
import "./planner.css";

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

const legacyStateToParamsMap: { [key: string]: string } = {
  platform: "platform",
  nodeCPU: "nodeCPU",
  nodeMemory: "nodeMemory",
  flashSize: "diskSize",
  usableCapacity: "totalCapacity",
  deploymentType: "deploymentType",
  nvmeTuning: "nvmeTuning",
  cephFSActive: "cephFSActive",
  nooBaaActive: "nooBaaActive",
  rgwActive: "rgwActive",
};

const stateToActionMap: {
  [key: string]: ActionCreatorWithPayload<any, any>;
} = {
  platform: setPlatform,
  nodeCPU: setNodeCPU,
  nodeMemory: setNodeMemory,
  flashSize: setFlashSize,
  usableCapacity: setUsableCapacity,
  deploymentType: setDeploymentType,
};

const legacyPlatformMap: { [key: string]: Platform } = {
  metal: Platform.BAREMETAL,
  awsAttached: Platform.AWSi3,
  awsEBS: Platform.AWSm5,
  gcp: Platform.GCP,
  azure: Platform.AZURE,
  vm: Platform.VMware,
  vmPreview: Platform.RHV,
};

const urlDataSanitizer = (param: string, data: unknown) => {
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
  if (param === "platform") {
    return legacyPlatformMap[data as string] || (data as Platform);
  }
  return data;
};

const mapStateToURL = (state: any): void => {
  const url = new URLSearchParams(window.location.search);
  // Remove legacy parameters
  Object.values(legacyStateToParamsMap).forEach((val) => url.delete(val));
  Object.entries(state).forEach(([key, val]) => {
    url.set(stateToParamsMap[key], val as string);
  });
  window.history.replaceState(
    {},
    "",
    `${window.location.href?.split("?")[0]}?${url.toString()}`
  );
};

const mapURLToState = (dispatch: Dispatch): void => {
  const url = new URLSearchParams(window.location.search);
  const legacy = url.has("platform");
  const paramsMap = legacy ? legacyStateToParamsMap : stateToParamsMap;
  Object.entries(paramsMap).forEach(([key, val]) => {
    if (url.has(val)) {
      dispatch(
        stateToActionMap[key](urlDataSanitizer(key, url.get(val)) as Payload)
      );
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

const Planner: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const prevValue = React.useRef<boolean>();
  const isTourActive = useSelector((state: any) => state.ui.isTourActive);
  const state = useSelector((state: any) => state.ocs);
  const dispatch = useDispatch();

  const isUPI = [Platform.RHV, Platform.BAREMETAL, Platform.VMware].includes(
    state.platform
  );

  React.useEffect(() => {
    mapURLToState(dispatch);
  }, []);

  React.useEffect(() => {
    // Update the state from URL once the tour Completes
    if (prevValue.current === true && isTourActive === false) {
      mapURLToState(dispatch);
    }
    // Update the state only if we are out of tour and the state is updates from the URL
    if (!isTourActive && prevValue.current === false) {
      mapStateToURL(state);
    }
    prevValue.current = isTourActive;
  }, [JSON.stringify(state), isTourActive]);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    const platform = event?.currentTarget?.id as Platform;
    setDropdownOpen((open) => !open);
    dispatch(setPlatform(platform));
  };

  const isPlatformTechPreview = React.useMemo(
    () => (TECH_PREV_PLATFORMS.includes(state.platform) ? "error" : "default"),
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
      {isUPI && <UpiPlatform />}
      <DiskSize />
    </Form>
  );
};

export default Planner;
