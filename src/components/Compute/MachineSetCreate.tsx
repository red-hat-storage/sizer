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
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  TextInput,
  TextInputProps,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { useDispatch, useSelector } from "react-redux";
import { addMachineSet, closeModal, Store } from "../../redux";
import SelectionList from "./SelectList";
import { Instance, Platform } from "../../types";
import { platformInstanceMap } from "../../cloudInstance";
import { Service, Workload } from "../../types";
import { getWorkloadResourceConsumption } from "../../utils/workload";
import {
  customEventPusher,
  MS_CREATE,
  useGetAnalyticClientID,
} from "../../analytics";
import { ODF_DEDICATED_MS_NAME } from "../../constants";

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

type MachineSetCreateProps = {
  isStoragePage?: boolean;
  onCreate?: (msName: string) => void;
};

const MachineSetCreate: React.FC<MachineSetCreateProps> = ({
  isStoragePage = false,
  onCreate,
}) => {
  const dispatch = useDispatch();
  const ui = useSelector((store: Store) => store.ui);
  const platform = useSelector((store: Store) => store.cluster.platform);
  const workloads = useSelector((store: Store) => store.workload);
  const services: Service[] = useSelector(
    (store: Store) => store.service.services
  );

  const existingMachineSets = useSelector((store: Store) => store.machineSet);

  const [name, setName] = React.useState("");
  const [cpu, setCPU] = React.useState(0);
  const [memory, setMem] = React.useState(0);

  const [isCpuOpen, setCpuOpen] = React.useState(false);
  const [isMemOpen, setMemOpen] = React.useState(false);

  const [selectedInstance, setInstance] = React.useState<string>("");

  const [isWorkloadListOpen, setWorkloadListOpen] = React.useState(false);
  const [selectedWorkloads, setWorkloads] = React.useState<Workload[]>([]);

  const onClose = () => dispatch(closeModal());

  const clientID = useGetAnalyticClientID();

  const workloadOptions = React.useMemo(
    () =>
      workloads
        .filter((workload) => !workload?.duplicateOf)
        .map((workload) => {
          const { totalMem, totalCPU } = getWorkloadResourceConsumption(
            workload,
            services
          );
          const description = `${workload.name} Memory Used: ${totalMem} CPU Used: ${totalCPU}`;
          return (
            <SelectOption
              value={workload.name}
              description={description}
              key={workload.name}
            />
          );
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(workloads)]
  );

  const isCloudPlatform = [Platform.AWS, Platform.AZURE, Platform.GCP].includes(
    platform
  );

  const create = () => {
    const instance = _.find<Instance>(
      platformInstanceMap[platform],
      (item) => item.name === selectedInstance
    );

    const instanceName = isCloudPlatform ? (instance?.name as string) : "";

    dispatch(
      addMachineSet({
        name: isStoragePage ? ODF_DEDICATED_MS_NAME : name,
        cpu: !isCloudPlatform ? cpu : (instance?.cpuUnits as number),
        memory: !isCloudPlatform ? memory : (instance?.memory as number),
        instanceName: isCloudPlatform ? (instance?.name as string) : "",
        numberOfDisks: 24,
        onlyFor: isStoragePage
          ? ["ODF"]
          : selectedWorkloads.map((workload) => workload.name),
        label: "Worker Node",
        instanceStorage: instance?.instanceStorage,
      })
    );

    if (clientID) {
      const params = {
        instanceName,
      };
      customEventPusher(MS_CREATE, params, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
    onCreate ? onCreate(ODF_DEDICATED_MS_NAME) : null;
    onClose();
  };

  const onSelect =
    (dropdown: string) => (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const amount = Number(event?.currentTarget?.id);
      if (dropdown === "NodeCPU") {
        setCPU(amount);
        setCpuOpen(false);
      } else {
        setMem(amount);
        setMemOpen(false);
      }
    };

  const onSelectWorkloads = (
    _event: React.MouseEvent | React.ChangeEvent,
    value: string | SelectOptionObject
  ) => {
    const names = selectedWorkloads.map((wl) => wl.name);
    if (names.includes(value as string)) {
      const tempSelected = selectedWorkloads.filter((wl) => wl.name !== value);
      setWorkloads(tempSelected);
    } else {
      const tempSelected = [
        ...selectedWorkloads,
        workloads.find((item) => item.name === value) as Workload,
      ];
      setWorkloads(tempSelected);
    }
  };

  const invalidName =
    existingMachineSets.find((ms) => ms.name === name) !== undefined;

  const msNameValidation: TextInputProps["validated"] = invalidName
    ? "error"
    : name.length === 0
    ? "error"
    : "success";

  const shouldDisableCreation =
    (msNameValidation === "error" && !isStoragePage) ||
    (isCloudPlatform ? !!selectedInstance : cpu === 0 || memory === 0);

  return (
    <Modal
      height="80vh"
      width="40vw"
      isOpen={CM_MODAL_ID === ui.openModal}
      onClose={onClose}
      title="Create Machine Set"
      actions={[
        <Button
          key="create"
          variant="primary"
          onClick={create}
          isDisabled={shouldDisableCreation}
        >
          Create
        </Button>,
      ]}
    >
      <Form className={cx("compute-ms-create__form--cloud")}>
        {!isStoragePage && (
          <FormGroup
            label="Machine Name"
            fieldId="machine-name"
            validated={msNameValidation}
            helperTextInvalid={
              name.length !== 0
                ? "A machineset with the same name already exists"
                : "Please enter a name"
            }
          >
            <TextInput
              id="machine-name"
              value={name}
              placeholder="Ex: hpc-machine"
              onChange={(val) => setName(val)}
            />
          </FormGroup>
        )}
        {isCloudPlatform && (
          <FormGroup label="Instance Type" fieldId="instance-type">
            <SelectionList
              id="instance-type"
              selection={selectedInstance}
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
                dropdownItems={nodeCpuCountItems}
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
                dropdownItems={nodeMemoryItems}
                onSelect={onSelect("NodeMemory")}
              />
            </FormGroup>
          </>
        )}
        {!isStoragePage && workloads.length > 0 && (
          <FormGroup label="Dedicate to Workloads" fieldId="memory-dropdown">
            <Select
              variant={SelectVariant.checkbox}
              isOpen={isWorkloadListOpen}
              onToggle={() => setWorkloadListOpen((open) => !open)}
              onClear={() => setWorkloads([])}
              selections={selectedWorkloads.map((wl) => wl.name)}
              onSelect={onSelectWorkloads}
            >
              {workloadOptions}
            </Select>
          </FormGroup>
        )}
      </Form>
    </Modal>
  );
};

export default MachineSetCreate;
