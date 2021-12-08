import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MachineSet } from "../../types";
import {
  closeModal,
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

export const MACHINESET_EDIT_MODAL = "MS_EDIT_MODAL";

type WorkloadEditModalProps = {
  machineSet: MachineSet;
};

const MachineSetEditModal: React.FC<WorkloadEditModalProps> = ({
  machineSet,
}) => {
  const dispatch = useDispatch();

  const { openModal, machines, workloads } = useSelector((store: Store) => ({
    openModal: store.ui.openModal,
    machines: store.machineSet,
    workloads: store.workload,
  }));

  const [dedicated, setDedicated] = React.useState(machineSet.onlyFor);
  const [isOpen, setOpen] = React.useState(false);

  const workloadOptions = React.useMemo(
    () =>
      workloads.map((workload) => {
        return <SelectOption value={workload.name} key={workload.name} />;
      }),
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
    const updateMS = Object.assign({}, machineSet, { onlyFor: dedicated });
    dispatch(updateMachineSet(updateMS));
    dispatch(removeAllNodes());
    dispatch(removeAllZones());
    dispatch(closeModal());
  };

  return (
    <Modal
      height="80vh"
      width="40vw"
      isOpen={MACHINESET_EDIT_MODAL === openModal}
      onClose={() => dispatch(closeModal())}
      title="Edit Machine Set"
      actions={[
        <Button key="save" variant="primary" onClick={updateMS}>
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
      className="machineset-edit__modal"
    >
      <Form>
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
