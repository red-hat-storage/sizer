import * as React from "react";
import * as _ from "lodash";
import {
  Button,
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
import { useDispatch, useSelector } from "react-redux";
import { addMachineSet, closeModal, Store } from "../../redux";
import { Instance, Platform } from "../../types";
import { platformInstanceMap } from "../../cloudInstance";
import { Service, Workload } from "../../types";
import { getWorkloadResourceConsumption } from "../../utils/workload";
import {
  customEventPusher,
  MS_CREATE,
  useGetAnalyticClientID,
} from "../../analytics";
import { ODF_DEDICATED_MS_NAME, ODF_WORKLOAD_NAME } from "../../constants";
import { getRandomName } from "./RandomComputeName";
import { InstancePlanner } from "./Common";

import "./machineSet.css";

export const CM_MODAL_ID = "CREATE_MASCHINE_SET";

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
        instanceName: isCloudPlatform
          ? (instance?.name as string)
          : getRandomName(),
        numberOfDisks: isCloudPlatform ? instance.maxDisks : 24,
        onlyFor: isStoragePage
          ? [ODF_WORKLOAD_NAME]
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
    (isCloudPlatform ? !selectedInstance : cpu === 0 || memory === 0);

  return (
    <Modal
      className="ms-modal"
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
      <Form className="ms-create__form--cloud">
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
        <InstancePlanner
          cpu={cpu}
          setCPU={setCPU}
          memory={memory}
          setMemory={setMem}
          instance={selectedInstance}
          setInstance={setInstance}
        />
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
