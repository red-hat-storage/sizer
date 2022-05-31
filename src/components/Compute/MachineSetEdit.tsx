import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MachineSet } from "../../types";
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

type WorkloadEditModalProps = {
  machineSet: MachineSet;
  onClose: any;
};

const MachineSetEditModal: React.FC<WorkloadEditModalProps> = ({
  machineSet,
  onClose: closeModal,
}) => {
  const dispatch = useDispatch();

  const { machines, workloads } = useSelector((store: Store) => ({
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
    const updateMS = Object.assign({}, machineSet, { onlyFor: dedicated });
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
        <Button key="save" variant="primary" onClick={updateMS}>
          Save
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => closeModal()}>
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
