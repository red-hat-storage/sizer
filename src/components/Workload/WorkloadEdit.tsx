import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Workload } from "../../models";
import { editWorkload, closeModal, Store } from "../../redux";
import {
  Modal,
  Form,
  FormGroup,
  TextInput,
  SelectOption,
  Select,
  SelectVariant,
  Button,
  SelectOptionObject,
} from "@patternfly/react-core";

/**
 * Editing Workload
 * 1) Requires Modal
 * 2) Show a dropdown to make it dedicated to some machine
 * 3) Workload Create should add a Checkbox and Dropdown
 */

export const WORKLOAD_EDIT_MODAL_ID = "WORKLOAD_EDIT";

type WorkloadEditModalProps = {
  workload: Workload;
};

const WorkloadEditFormModal: React.FC<WorkloadEditModalProps> = ({
  workload,
}) => {
  const dispatch = useDispatch();

  const openModal = useSelector((store: Store) => store.ui.openModal);
  const machines = useSelector((store: Store) => store.machineSet);

  const [name, setName] = React.useState(workload.name);
  const [count, setCount] = React.useState(workload.count);
  const [usesMachines, setMachines] = React.useState(workload.usesMachines);
  const [storageCapacity, setStorageCapacity] = React.useState(
    workload.storageCapacityRequired
  );

  const [isOpen, setOpen] = React.useState(false);

  const machineOptions = React.useMemo(
    () =>
      machines.map((machine) => {
        const description = machine.onlyFor
          ? `Machine is dedicated for: ${machine.onlyFor.join(",")}`
          : null;
        return (
          <SelectOption
            value={machine.name}
            key={machine.name}
            description={description}
          />
        );
      }),
    [JSON.stringify(machines)]
  );

  const onSelectMachines = (_event: any, machine: SelectOptionObject) => {
    setMachines([...usesMachines, machine as string]);
  };

  const updateWorkload = () => {
    const newWorkload: Workload = {
      uid: workload.uid,
      name,
      count,
      usesMachines: usesMachines ? usesMachines : [],
      services: workload.services,
      storageCapacityRequired: storageCapacity,
    };
    dispatch(editWorkload(newWorkload));
    dispatch(closeModal());
  };

  return (
    <Modal
      height="80vh"
      width="40vw"
      isOpen={WORKLOAD_EDIT_MODAL_ID === openModal}
      onClose={() => dispatch(closeModal())}
      title="Edit Machine Set"
      actions={[
        <Button key="save" variant="primary" onClick={updateWorkload}>
          Save
        </Button>,
        <Button
          key="cancel"
          variant="secondary"
          onClick={() => dispatch(closeModal())}
        >
          Cancel
        </Button>,
      ]}
    >
      <Form>
        <FormGroup label="Name" fieldId="name-field">
          <TextInput value={name} onChange={setName} />
        </FormGroup>
        <FormGroup label="Count" fieldId="count-field">
          <TextInput
            value={count}
            type="number"
            onChange={(val) => setCount(Number(val))}
            min={0}
          />
        </FormGroup>
        <FormGroup label="Uses Machines" fieldId="uses-machines">
          <Select
            variant={SelectVariant.checkbox}
            isOpen={isOpen}
            onToggle={() => setOpen((o) => !o)}
            onClear={() => setMachines([])}
            selections={usesMachines.map((m) => m)}
            onSelect={onSelectMachines}
          >
            {machineOptions}
          </Select>
        </FormGroup>
        <FormGroup label="Storage Capacity" fieldId="storage-capacity">
          <TextInput
            value={storageCapacity}
            type="number"
            onChange={(val) => setStorageCapacity(Number(val))}
            min={0}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default WorkloadEditFormModal;
