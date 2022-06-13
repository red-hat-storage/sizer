import * as React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Alert,
  Checkbox,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Tile,
  Button,
} from "@patternfly/react-core";
import { EditIcon } from "@patternfly/react-icons";

import { useDispatch, useSelector } from "react-redux";
import { addServices, addWorkload, closeModal, Store } from "../../redux";
import { applyModifier, createDuplicates, isValidWorkload } from "./util";
import * as jsyaml from "js-yaml";
import { WorkloadDescriptor } from "../../types";
import {
  defaultWorkloads,
  defaultWorkloadsIconMap,
  defaultWorkloadsModifierMap,
  defaultWorkloadsNameMap,
} from "./defaultWorkloads";
import "./workload.css";
import { getWorkloadFromDescriptors } from "../../utils/workload";
import { customEventPusher, useGetAnalyticClientID } from "../../analytics";
import { WORKLOAD_CREATE } from "../../analytics/constants";
import { Dedicated } from "../Common/Icon";

const defaultWorkload = `# An arbitraty name for this workload
name: tester
# The amount of times this workload runs on the cluster
count: 3
# If this workload should always run on a particular set of machines
usesMachines:
  - default
# Storage that is used by this workload (Provisioned by ODF)
storageCapacityRequired: 1000
# A list of Services/Pods that make up this workload
services:
  # A human friendly name for this Service
  - name: serviceA
    # The amount of CPU units that this Pod requires
    #  This can be fractional
    requiredCPU: 5
    # The amount of RAM (in GB) that this Pod requires
    #  This can be fractional
    requiredMemory: 16
    # The amount of zones this spans (for clustered Pods)
    zones: 3
    # The name of services within this workload
    # that should run on the same node as this service
    runsWith: []
    # The name of services within this workload
    # that should NOT run on the same node as this service
    avoid: []
`;

/**
 * Example Workload (YAML)
 * 
name: tester
count: 3
usesMachines:
  - default
services:
  - name: serviceA
    requiredCPU: 5
    requiredMemory: 16
    zones: 3
    runsWith: []
    avoid: []

*/
export const WL_MODAL_ID = "WORKLOAD_MODAL";

type WorkloadSelectCard = {
  workloadName?: string;
  workloadIcon: React.ComponentClass;
};

const WorkloadSelectCard: React.FC<WorkloadSelectCard> = ({
  workloadName,
  workloadIcon: Icon,
}) => (
  <Tile title={workloadName || ""} icon={<Icon />} isStacked isDisplayLarge />
);

const WorkloadCreate: React.FC = () => {
  const openModal = useSelector((store: Store) => store.ui.openModal);
  const machines = useSelector((store: Store) => store.machineSet);
  const dispatch = useDispatch();

  const [isCustom, setCustom] = React.useState(false);
  const [isDedicated, setDedicated] = React.useState(false);
  const [usesMachines, setMachines] = React.useState<string[]>([]);
  const [isOpen, setOpen] = React.useState(false);

  // Custom Workload State
  const [customWorkload, setCustomWorkload] =
    React.useState<WorkloadDescriptor>();
  const [error, setError] = React.useState("");

  const onClose = () => {
    setCustom(false);
    dispatch(closeModal());
  };

  const clientID = useGetAnalyticClientID();

  const onCreate =
    (
      workloadName: string,
      workloadModifier: Partial<WorkloadDescriptor>,
      workloadObject?: WorkloadDescriptor,
      modifierName?: string
    ) =>
    () => {
      if (workloadName && workloadModifier) {
        const wl = applyModifier(
          defaultWorkloadsNameMap[workloadName],
          workloadModifier
        );
        wl.usesMachines = usesMachines ? usesMachines : [];
        const { services, workload } = getWorkloadFromDescriptors(wl);
        dispatch(addServices(services));
        dispatch(addWorkload(workload));
        const workloadDescriptors = createDuplicates(wl, workload.id);
        workloadDescriptors.forEach((wld) => {
          const { services: serviceDup, workload: workloadDup } =
            getWorkloadFromDescriptors(wld);
          dispatch(addServices(serviceDup));
          dispatch(addWorkload(workloadDup));
        });
      } else if (workloadObject) {
        workloadObject.usesMachines = usesMachines ? usesMachines : [];
        const { services, workload } =
          getWorkloadFromDescriptors(workloadObject);
        dispatch(addServices(services));
        dispatch(addWorkload(workload));
        const workloadDescriptors = createDuplicates(
          workloadObject,
          workload.id
        );
        workloadDescriptors.forEach((wld) => {
          const { services: serviceDup, workload: workloadDup } =
            getWorkloadFromDescriptors(wld);
          dispatch(addServices(serviceDup));
          dispatch(addWorkload(workloadDup));
        });
      }

      if (clientID) {
        const params = {
          workload_name: workloadName,
          workload_modifier: modifierName,
        };
        customEventPusher(WORKLOAD_CREATE, params, clientID).catch((err) =>
          console.error("Error sending data to analytics service", err)
        );
      }

      onClose();
    };

  const machineOptions = React.useMemo(
    () =>
      machines.map((machine) => {
        return (
          <SelectOption
            value={machine.name}
            key={machine.name}
            isDisabled={machine.onlyFor.length !== 0}
          >
            {machine.name}{" "}
            {machine.onlyFor.length > 0 && <Dedicated addMarginToLeft />}
          </SelectOption>
        );
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

  const isValid =
    isValidWorkload(customWorkload as WorkloadDescriptor) && !error;

  return (
    <Modal
      className="workload__Modal"
      title="Create a Workload"
      isOpen={WL_MODAL_ID === openModal}
      onClose={onClose}
      height="88vh"
      minLength={20}
      width="60vw"
      actions={
        isCustom
          ? [
              <Button
                key="save"
                variant="primary"
                isDisabled={!isValid}
                onClick={onCreate("", {}, customWorkload)}
              >
                Create
              </Button>,
            ]
          : []
      }
    >
      <div className="workload__checkbox">
        <Checkbox
          label="Dedicate this workload to a MachineSet"
          isChecked={isDedicated}
          onChange={() => setDedicated((s) => !s)}
          id="checkbox-dedicated"
        />
        {isDedicated && (
          <Select
            width={300}
            variant={SelectVariant.checkbox}
            isOpen={isOpen}
            onToggle={() => setOpen((o) => !o)}
            onClear={() => setMachines([])}
            selections={usesMachines.map((m) => m)}
            onSelect={onSelectMachines}
          >
            {machineOptions}
          </Select>
        )}
      </div>
      {!isCustom ? (
        <div>
          <DataList aria-label="Default Workloads">
            {defaultWorkloads.map((wl) => (
              <DataListItem key={wl.name}>
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell
                        key={`${wl.name}-workload-icon`}
                        className="workload__dataList--center"
                      >
                        <WorkloadSelectCard
                          // workloadName={wl.name}
                          workloadIcon={defaultWorkloadsIconMap[wl.name] as any}
                        />
                      </DataListCell>,
                      <DataListCell
                        key={`${wl.name}-workload-name`}
                        className="workload__dataList--center"
                      >
                        {wl.name}
                      </DataListCell>,
                    ]}
                  />
                  <DataListAction
                    className="workload__dataList--center"
                    aria-label="Workload Modifiers"
                    aria-labelledby="none"
                    id="modifiers"
                  >
                    {defaultWorkloadsModifierMap[wl.name]
                      ? Object.entries(
                          defaultWorkloadsModifierMap[wl.name]
                        ).map(([modifierName, modifierObject]) => (
                          <Button
                            key={`${wl.name}-workload-btn-${modifierName}`}
                            onClick={onCreate(
                              wl.name,
                              modifierObject,
                              null,
                              modifierName
                            )}
                          >
                            {modifierName}
                          </Button>
                        ))
                      : null}
                  </DataListAction>
                </DataListItemRow>
              </DataListItem>
            ))}
            <DataListItem key="custom">
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell
                      key={`custom-workload-icon`}
                      className="workload__dataList--center"
                    >
                      <WorkloadSelectCard
                        workloadName="Custom"
                        workloadIcon={EditIcon}
                      />
                    </DataListCell>,
                    <DataListCell
                      key={`custom-workload-name`}
                      className="workload__dataList--center"
                    >
                      Create a custom Workload
                    </DataListCell>,
                  ]}
                />
                <DataListAction
                  aria-label="Workload Modifiers"
                  aria-labelledby="none"
                  id="modifiers"
                  className="workload__dataList--center"
                >
                  <Button onClick={() => setCustom(true)}>Create</Button>
                </DataListAction>
              </DataListItemRow>
            </DataListItem>
          </DataList>
        </div>
      ) : (
        <>
          <CustomWorkloadCreate
            setWorkload={setCustomWorkload}
            error={error}
            setError={setError}
          />
        </>
      )}
    </Modal>
  );
};

type CustomWorkloadCreateProps = {
  setWorkload: React.Dispatch<
    React.SetStateAction<WorkloadDescriptor | undefined>
  >;
  setError: (val: string) => void;
  error: string;
};

const CustomWorkloadCreate: React.FC<CustomWorkloadCreateProps> = ({
  setWorkload,
  error,
  setError,
}) => {
  const [code, setCode] = React.useState(defaultWorkload);

  const onChange = (val: string) => {
    setCode(val);
    setError("");
    try {
      const model = jsyaml.load(val, { json: true });
      setWorkload(model as WorkloadDescriptor);
    } catch (e) {
      setError(String(e));
    }
  };

  const onEditorMount = (editor: any, monaco: any) => {
    try {
      const model = jsyaml.load(defaultWorkload, { json: true });
      setWorkload(model as WorkloadDescriptor);
    } catch (e) {
      setError(String(e));
    }
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };
  return (
    <>
      <CodeEditor
        isDarkTheme={true}
        isLineNumbersVisible={true}
        isMinimapVisible={true}
        isLanguageLabelVisible
        code={code}
        onChange={onChange as any}
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

export default WorkloadCreate;
