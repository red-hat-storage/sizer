import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Instance, MachineSet } from "../../types";
import {
  removeAllNodes,
  removeAllZones,
  Store,
  updateMachineSet,
} from "../../redux";
import {
  Modal,
  Form,
  FormGroup,
  SelectOption,
  Select,
  SelectVariant,
  Button,
  SelectOptionObject,
} from "@patternfly/react-core";
import { platformInstanceMap } from "../../cloudInstance";
import * as _ from "lodash";
import { InstancePlanner } from "./Common";
import { isCloudPlatform as affirmCloudPlatform } from "../../utils";

type WorkloadEditModalProps = {
  machineSet: MachineSet;
  onClose: any;
};

const MachineSetEditModal: React.FC<WorkloadEditModalProps> = ({
  machineSet,
  onClose: closeModal,
}) => {
  const dispatch = useDispatch();

  const { machines, workloads, platform } = useSelector((store: Store) => ({
    machines: store.machineSet,
    workloads: store.workload,
    platform: store.cluster.platform,
  }));

  const [dedicated, setDedicated] = React.useState(machineSet.onlyFor);
  const [isOpen, setOpen] = React.useState(false);
  const [selectedInstance, setInstance] = React.useState<string>(
    machineSet.instanceName
  );
  const [cpu, setCPU] = React.useState(machineSet.cpu);
  const [memory, setMem] = React.useState(machineSet.memory);
  const isCloudPlatform = affirmCloudPlatform(platform);

  const workloadOptions = React.useMemo(
    () =>
      workloads.map((workload) => {
        return <SelectOption value={workload.name} key={workload.name} />;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(machines)]
  );

  const onSelectMachines = (_event: any, workload: SelectOptionObject) => {
    if (dedicated.includes(workload as string)) {
      const updatedWorkloads = dedicated.filter((m) => m !== workload);
      setDedicated(updatedWorkloads);
    } else {
      setDedicated([...dedicated, workload as string]);
    }
  };

  const updateMS = () => {
    const instance = _.find<Instance>(
      platformInstanceMap[platform],
      (item) => item.name === selectedInstance
    );
    const updateMS = Object.assign({}, machineSet, {
      onlyFor: dedicated,
      instanceName: selectedInstance,
      cpu: isCloudPlatform ? instance.cpuUnits : cpu,
      memory: isCloudPlatform ? instance.memory : memory,
      instanceStorage: isCloudPlatform
        ? instance.instanceStorage
        : machineSet.instanceStorage,
      numberOfDisks: isCloudPlatform
        ? instance.maxDisks
        : machineSet.numberOfDisks,
    });
    dispatch(updateMachineSet(updateMS));
    dispatch(removeAllNodes());
    dispatch(removeAllZones());
    closeModal();
  };

  return (
    <Modal
      height="80vh"
      width="40vw"
      className="ms-modal"
      isOpen={true}
      onClose={() => closeModal()}
      title="Edit Machine Set"
      actions={[
        <Button
          key="save"
          variant="primary"
          onClick={updateMS}
          isDisabled={!selectedInstance}
        >
          Save
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => closeModal()}>
          Cancel
        </Button>,
      ]}
    >
      <Form>
        <InstancePlanner
          cpu={cpu}
          setCPU={setCPU}
          memory={memory}
          setMemory={setMem}
          instance={selectedInstance}
          setInstance={setInstance}
        />
        <FormGroup label="Dedicate to Workload" fieldId="dedicated-workloads">
          <Select
            variant={SelectVariant.checkbox}
            isOpen={isOpen}
            onToggle={() => setOpen((o) => !o)}
            onClear={() => setDedicated([])}
            selections={dedicated}
            onSelect={onSelectMachines}
          >
            {workloadOptions}
          </Select>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default MachineSetEditModal;
