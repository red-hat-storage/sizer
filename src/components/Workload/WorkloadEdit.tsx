import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Workload } from "../../types";
import { Store, addServices, addWorkload } from "../../redux";
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
import {
  getDescriptorFromWorkload,
  getWorkloadFromDescriptors,
  removeWorkloadSafely,
} from "../../utils/workload";
import { createDuplicates } from "./util";

/**
 * Editing Workload
 * 1) Requires Modal
 * 2) Show a dropdown to make it dedicated to some machine
 * 3) Workload Create should add a Checkbox and Dropdown
 */

export const WORKLOAD_EDIT_MODAL_ID = "WORKLOAD_EDIT";

type WorkloadEditModalProps = {
  workload: Workload;
  onClose: any;
};

const WorkloadEditFormModal: React.FC<WorkloadEditModalProps> = ({
  workload,
  onClose: closeModal,
}) => {
  const dispatch = useDispatch();

  const { machines, services, workloads } = useSelector((store: Store) => ({
    openModal: store.ui.openModal,
    machines: store.machineSet,
    services: store.service.services,
    workloads: store.workload,
  }));

  const [name, setName] = React.useState(workload.name);
  const [count, setCount] = React.useState(workload.count);
  const [usesMachines, setMachines] = React.useState(workload.usesMachines);
  const [storageCapacity, setStorageCapacity] = React.useState(
    workload.storageCapacityRequired
  );

  const [isOpen, setOpen] = React.useState(false);

  const machineOptions = React.useMemo(
    () =>
      machines
        .filter((machine) => machine.onlyFor.length === 0)
        .map((machine) => {
          return <SelectOption value={machine.name} key={machine.name} />;
        }),
    [JSON.stringify(machines)]
  );

  const onSelectMachines = (_event: any, machine: SelectOptionObject) => {
    if (usesMachines.includes(machine as string)) {
      const updatedMachines = usesMachines.filter((m) => m !== machine);
      setMachines(updatedMachines);
    } else {
      setMachines([...usesMachines, machine as string]);
    }
  };

  const updateWorkload = () => {
    const remover = removeWorkloadSafely(dispatch);
    remover(workload, services);
    const duplicateWorkloads = workloads.filter(
      (wl) => wl.duplicateOf === workload.id
    );
    duplicateWorkloads.forEach((wl) => remover(wl, services));
    const descriptor = getDescriptorFromWorkload(workload, services);
    descriptor.name = name;
    descriptor.count = count;
    descriptor.usesMachines = usesMachines ? usesMachines : [];
    descriptor.storageCapacityRequired = storageCapacity;
    const {
      services: wlServices,
      workload: newWorkload,
    } = getWorkloadFromDescriptors(descriptor);
    dispatch(addServices(wlServices));
    dispatch(addWorkload(newWorkload));
    const workloadDescriptors = createDuplicates(descriptor, newWorkload.id);
    workloadDescriptors.forEach((wld) => {
      const {
        services: serviceDup,
        workload: workloadDup,
      } = getWorkloadFromDescriptors(wld);
      dispatch(addServices(serviceDup));
      dispatch(addWorkload(workloadDup));
    });
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
        <Button key="save" variant="primary" onClick={updateWorkload}>
          Save
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => closeModal()}>
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
