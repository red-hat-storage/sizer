import * as React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
} from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import SelectionList from "./SelectList";
import { CaretDownIcon } from "@patternfly/react-icons";
import { isCloudPlatform as affirmCloudPlatform } from "../../utils";

const NodeCpuCountItems = [
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
  <DropdownItem key="60" id="60">
    60
  </DropdownItem>,
  <DropdownItem key="72" id="72">
    72
  </DropdownItem>,
  <DropdownItem key="84" id="84">
    84
  </DropdownItem>,
  <DropdownItem key="96" id="96">
    96
  </DropdownItem>,
];

const NodeMemoryItems = [
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
  <DropdownItem key="160" id="160">
    160
  </DropdownItem>,
  <DropdownItem key="192" id="192">
    192
  </DropdownItem>,
  <DropdownItem key="256" id="256">
    256
  </DropdownItem>,
  <DropdownItem key="512" id="512">
    512
  </DropdownItem>,
];

type InstancePlannerProps = {
  cpu: number;
  setCPU: React.Dispatch<React.SetStateAction<number>>;
  memory: number;
  setMemory: React.Dispatch<React.SetStateAction<number>>;
  instance: string;
  setInstance: React.Dispatch<React.SetStateAction<string>>;
};

export const InstancePlanner: React.FC<InstancePlannerProps> = ({
  cpu,
  setCPU,
  memory,
  setMemory,
  instance,
  setInstance,
}) => {
  const [isCpuOpen, setCpuOpen] = React.useState(false);
  const [isMemOpen, setMemOpen] = React.useState(false);

  const platform = useSelector((store: Store) => store.cluster.platform);
  const isCloudPlatform = affirmCloudPlatform(platform);

  const onSelect =
    (dropdown: string) => (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const amount = Number(event?.currentTarget?.id);
      if (dropdown === "NodeCPU") {
        setCPU(amount);
        setCpuOpen(false);
      } else {
        setMemory(amount);
        setMemOpen(false);
      }
    };

  return (
    <>
      {isCloudPlatform && (
        <FormGroup label="Instance Type" fieldId="instance-type">
          <SelectionList
            id="instance-type"
            selection={instance}
            setInstance={setInstance}
          />
        </FormGroup>
      )}
      {!isCloudPlatform && (
        <>
          <FormGroup label="CPU unit count" fieldId="cpu-dropdown">
            <Dropdown
              id="cpu-dropdown"
              className="planner-form__dropdown"
              isOpen={isCpuOpen}
              toggle={
                <DropdownToggle
                  onToggle={() => setCpuOpen((open) => !open)}
                  toggleIndicator={CaretDownIcon}
                >
                  {String(cpu)}
                </DropdownToggle>
              }
              dropdownItems={NodeCpuCountItems}
              onSelect={onSelect("NodeCPU")}
            />
          </FormGroup>
          <FormGroup label="Memory unit count" fieldId="memory-dropdown">
            <Dropdown
              className="planner-form__dropdown"
              id="memory-dropdown"
              isOpen={isMemOpen}
              toggle={
                <DropdownToggle
                  onToggle={() => setMemOpen((open) => !open)}
                  toggleIndicator={CaretDownIcon}
                >
                  {String(memory)}
                </DropdownToggle>
              }
              dropdownItems={NodeMemoryItems}
              onSelect={onSelect("NodeMemory")}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};
