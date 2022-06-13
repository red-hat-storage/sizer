import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Workload, WorkloadDescriptor } from "../../types";
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
  Alert,
  Title,
  FlexItem,
  Flex,
  ButtonVariant,
} from "@patternfly/react-core";
import {
  getDescriptorFromWorkload,
  getWorkloadFromDescriptors,
  removeWorkloadSafely,
} from "../../utils/workload";
import { createDuplicates } from "./util";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { ChangeHandler } from "react-monaco-editor";
import * as jsyaml from "js-yaml";
import * as _ from "lodash";
import "./workloadEdit.css";

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

type WorkloadAdvancedEditorProps = {
  workload: string;
  onChange?: ChangeHandler;
  error: string;
  setError: (value: string) => any;
};

const WorkloadAdvancedEditor: React.FC<WorkloadAdvancedEditorProps> = ({
  workload,
  onChange,
  error,
  setError,
}) => {
  const onEditorMount = (editor: any, monaco: any) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };

  const _onChange: ChangeHandler = (data, event) => {
    try {
      jsyaml.load(data, { json: true });
      onChange(data, event);
    } catch (e) {
      setError(String(e));
    }
  };
  return (
    <>
      <CodeEditor
        isDarkTheme={true}
        isLineNumbersVisible={true}
        isMinimapVisible={true}
        isLanguageLabelVisible
        code={workload}
        onChange={_onChange}
        language={Language.yaml}
        onEditorDidMount={onEditorMount}
        height="60vh"
      />
      {error && (
        <Alert variant="danger" isInline title="Error parsing YAML">
          {error}
        </Alert>
      )}
    </>
  );
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

  // Advanced Editor
  const [advancedEditor, setAdvancedEditor] = React.useState(false);
  const [error, setError] = React.useState("");

  // Workload Descriptors
  const [workloadYAML, setWorkloadYAML] = React.useState<string>(() => {
    const workloadDescriptor = getDescriptorFromWorkload(workload, services);
    return jsyaml.dump(_.omit(workloadDescriptor, ["id", "duplicateOf"]));
  });

  const machineOptions = React.useMemo(
    () =>
      machines
        .filter((machine) => machine.onlyFor.length === 0)
        .map((machine) => {
          return <SelectOption value={machine.name} key={machine.name} />;
        }),
    [machines]
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
    let descriptor: WorkloadDescriptor = null;
    if (!advancedEditor) {
      descriptor = getDescriptorFromWorkload(workload, services);
      descriptor.name = name;
      descriptor.count = count;
      descriptor.usesMachines = usesMachines ? usesMachines : [];
      descriptor.storageCapacityRequired = storageCapacity;
    } else {
      descriptor = jsyaml.load(workloadYAML) as WorkloadDescriptor;
    }
    const { services: wlServices, workload: newWorkload } =
      getWorkloadFromDescriptors(descriptor);
    dispatch(addServices(wlServices));
    dispatch(addWorkload(newWorkload));
    const workloadDescriptors = createDuplicates(descriptor, newWorkload.id);
    workloadDescriptors.forEach((wld) => {
      const { services: serviceDup, workload: workloadDup } =
        getWorkloadFromDescriptors(wld);
      dispatch(addServices(serviceDup));
      dispatch(addWorkload(workloadDup));
    });
    closeModal();
  };

  const onChange = (data) => {
    setWorkloadYAML(data);
  };

  const Header = () => (
    <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
      <FlexItem>
        <Title headingLevel="h1">Edit MachineSet</Title>
      </FlexItem>
      {!advancedEditor && (
        <FlexItem>
          <Button
            onClick={() => setAdvancedEditor(true)}
            variant={ButtonVariant.link}
            isInline
          >
            Edit YAML
          </Button>
        </FlexItem>
      )}
    </Flex>
  );

  return (
    <Modal
      height="80vh"
      width="40vw"
      isOpen={true}
      onClose={() => closeModal()}
      header={<Header />}
      actions={[
        <Button
          key="save"
          variant="primary"
          onClick={updateWorkload}
          isDisabled={!!error}
        >
          Save
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => closeModal()}>
          Cancel
        </Button>,
      ]}
    >
      {advancedEditor ? (
        <WorkloadAdvancedEditor
          workload={workloadYAML}
          onChange={onChange}
          error={error}
          setError={setError}
        />
      ) : (
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
              className="edit-workload__storage-capacity"
              maxLength={20}
              value={storageCapacity}
              type="number"
              onChange={(val) => setStorageCapacity(Number(val))}
              min={0}
            />{" "}
            GB
          </FormGroup>
        </Form>
      )}
    </Modal>
  );
};

export default WorkloadEditFormModal;
