import * as React from "react";
import * as _ from "lodash";
import cx from "classnames";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
  Modal,
  TextInput,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { useDispatch, useSelector } from "react-redux";
import { addMachineSet, closeModal, Store } from "../../redux";
import SelectionList from "./SelectList";
import { Platform } from "../../types";
import { platformInstanceMap } from "../../cloudInstance";

export const CM_MODAL_ID = "CREATE_MASCHINE_SET";

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
const MachineSetCreate: React.FC = () => {
  const dispatch = useDispatch();
  const ui = useSelector((store: Store) => store.ui);
  const platform = useSelector((store: Store) => store.cluster.platform);

  const [name, setName] = React.useState("");
  const [cpu, setCPU] = React.useState(0);
  const [memory, setMem] = React.useState(0);
  const [onlyFor, setOnlyFor] = React.useState([]);

  const [isCpuOpen, setCpuOpen] = React.useState(false);
  const [isMemOpen, setMemOpen] = React.useState(false);
  const [isSelectListOpen, setSelectListOpen] = React.useState(false);

  const [selectedInstance, setInstance] = React.useState<string>("");

  const onClose = () => dispatch(closeModal());

  const isCloudPlatform = [Platform.AWS, Platform.AZURE, Platform.GCP].includes(
    platform
  );

  const create = () => {
    const instance = _.find(
      platformInstanceMap[platform as "AWS"],
      (item) => item.name === selectedInstance
    );

    dispatch(
      addMachineSet({
        name,
        cpu: !isCloudPlatform ? cpu : (instance?.cpuUnits as number),
        memory: !isCloudPlatform ? memory : (instance?.memory as number),
        instanceName: isCloudPlatform ? (instance?.name as string) : "",
        numberOfDisks: 24,
        onlyFor,
      })
    );
    onClose();
  };

  const onSelect = (dropdown: string) => (
    event?: React.SyntheticEvent<HTMLDivElement>
  ) => {
    const amount = Number(event?.currentTarget?.id);
    if (dropdown === "NodeCPU") {
      setCPU(amount);
      setCpuOpen(false);
    } else {
      setMem(amount);
      setMemOpen(false);
    }
  };

  return (
    <Modal
      height="80vh"
      width="40vw"
      isOpen={CM_MODAL_ID === ui.openModal}
      onClose={onClose}
      title="Create Machine Set"
      actions={[
        <Button key="create" variant="primary" onClick={create}>
          Create
        </Button>,
      ]}
    >
      <Form
        className={cx({
          "compute-ms-create__form--cloud": isCloudPlatform && isSelectListOpen,
        })}
      >
        <FormGroup label="Machine Name" fieldId="machine-name">
          <TextInput value={name} onChange={(val) => setName(val)} />
        </FormGroup>
        <FormGroup label="Instance Type" fieldId="instance-type">
          <SelectionList
            isOpen={isSelectListOpen}
            setOpen={setSelectListOpen}
            selection={selectedInstance}
            setInstance={setInstance}
          />
        </FormGroup>
        {!isCloudPlatform && (
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
              dropdownItems={nodeCpuCountItems}
              onSelect={onSelect("NodeCPU")}
            />
          </FormGroup>
        )}
        {!isCloudPlatform && (
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
              dropdownItems={nodeMemoryItems}
              onSelect={onSelect("NodeMemory")}
            />
          </FormGroup>
        )}
      </Form>
    </Modal>
  );
};

export default MachineSetCreate;
