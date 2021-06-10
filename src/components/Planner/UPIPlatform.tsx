import {
  FormGroup,
  Dropdown,
  DropdownToggle,
  DropdownItem,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setNodeCPU, setNodeMemory } from "../../redux";

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

const UpiPlatform: React.FC = () => {
  const state = useSelector((state: any) => state.ocs);
  const dispatch = useDispatch();
  const [isCpuOpen, setCpuOpen] = React.useState(false);
  const [isMemOpen, setMemOpen] = React.useState(false);

  const onSelect = (dropdown: string) => (
    event?: React.SyntheticEvent<HTMLDivElement>
  ) => {
    const action = dropdown === "NodeCPU" ? setNodeCPU : setNodeMemory;
    if (dropdown === "NodeCPU") {
      setCpuOpen(false);
    } else {
      setMemOpen(false);
    }
    const amount = Number(event?.currentTarget?.id);
    dispatch(action(amount));
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
              {String(state.nodeCPU)}
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
              {state.nodeMemory?.toString()}
            </DropdownToggle>
          }
          dropdownItems={nodeMemoryItems}
          onSelect={onSelect("NodeMemory")}
        />
      </FormGroup>
    </>
  );
};

export default UpiPlatform;
