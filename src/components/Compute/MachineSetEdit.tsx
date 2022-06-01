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
import SelectionList from "./SelectList";
import { platformInstanceMap } from "../../cloudInstance";
import * as _ from "lodash";

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
      cpu: instance.cpuUnits,
      memory: instance.memory,
      instanceStorage: instance.instanceStorage,
      numberOfDisks: instance.maxDisks,
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
      className="machineset-edit__modal"
    >
      <Form>
        <FormGroup label="Instance Type" fieldId="instance-type">
          <SelectionList
            selection={selectedInstance}
            setInstance={setInstance}
          />
        </FormGroup>
        <FormGroup label="Dedicate to Workload" fieldId="dedicated-workloads">
          <Select
            variant={SelectVariant.typeaheadMulti}
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
