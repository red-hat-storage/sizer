import * as React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Alert,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Modal,
  Tile,
} from "@patternfly/react-core";
import { EditIcon } from "@patternfly/react-icons";

import { useDispatch, useSelector } from "react-redux";
import { addWorkload, closeModal, Store } from "../../redux";
import { isValidWorkload } from "./util";
import * as jsyaml from "js-yaml";
import { Workload } from "../../models";
import {
  defaultWorkloads,
  defaultWorkloadsIconMap,
  defaultWorkloadsModifierMap,
} from "./defaultWorkloads";
import { Button } from "@patternfly/react-code-editor/node_modules/@patternfly/react-core";
import "./workload.css";

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
  workloadName: string;
  workloadIcon: React.ComponentClass;
  onClick: any;
};

const WorkloadSelectCard: React.FC<WorkloadSelectCard> = ({
  workloadName,
  workloadIcon: Icon,
  onClick,
}) => (
  <Tile
    title={workloadName}
    icon={<Icon />}
    onClick={onClick}
    isStacked
    isDisplayLarge
  />
);

const WorkloadCreate: React.FC = () => {
  const openModal = useSelector((store: Store) => store.ui.openModal);
  const dispatch = useDispatch();

  const [workload, setWorkload] = React.useState<Workload>();
  const [isCustom, setCustom] = React.useState(false);
  const [workloadModifier, setWorkLoadModifier] = React.useState("");

  const onClose = () => {
    setWorkload(undefined);
    setCustom(false);
    dispatch(closeModal());
  };

  const onClick = (workload: Workload) => () => {
    setCustom(false);
    setWorkload(workload);
    setWorkLoadModifier("");
  };

  const modifiers = workload?.name
    ? defaultWorkloadsModifierMap[workload?.name]
    : null;

  const onCreate = () => {
    if (workload) {
      dispatch(addWorkload(workload));
      onClose();
    }
  };

  const isValid =
    isValidWorkload(workload as Workload) &&
    (modifiers ? !!workloadModifier : true);

  return (
    <Modal
      className="workload__Modal"
      title="Create a Workload"
      isOpen={WL_MODAL_ID === openModal}
      onClose={onClose}
      height="88vh"
      minLength={20}
      width="60vw"
      actions={[
        <Button
          key="save"
          variant="primary"
          isDisabled={!isValid}
          onClick={onCreate}
        >
          Create
        </Button>,
      ]}
    >
      {!isCustom ? (
        <>
          <div>
            {defaultWorkloads.map((workload) => (
              <WorkloadSelectCard
                key={workload.name}
                workloadName={workload.name}
                workloadIcon={defaultWorkloadsIconMap[workload.name] as any}
                onClick={onClick(workload)}
              />
            ))}
            <WorkloadSelectCard
              workloadName="Custom"
              workloadIcon={EditIcon}
              onClick={() => {
                setCustom(true);
                setWorkload(undefined);
              }}
            />
          </div>
          {modifiers && (
            <div>
              <WorkloadModifier
                modifiers={modifiers}
                onChange={(item: string) => setWorkLoadModifier(item)}
                current={workloadModifier}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <CustomWorkloadCreate setWorkload={setWorkload} />
        </>
      )}
    </Modal>
  );
};

type CustomWorkloadCreateProps = {
  setWorkload: React.Dispatch<React.SetStateAction<Workload | undefined>>;
};

const CustomWorkloadCreate: React.FC<CustomWorkloadCreateProps> = ({
  setWorkload,
}) => {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  const onChange = (val: string) => {
    setCode(val);
    setError("");
    try {
      const model = jsyaml.load(val, { json: true });
      setWorkload(model as Workload);
    } catch (e) {
      setError(String(e));
    }
  };

  const onEditorMount = (editor: any, monaco: any) => {
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

type WorkloadModifierProps = {
  modifiers: string[];
  onChange: any;
  current?: string;
};

const WorkloadModifier: React.FC<WorkloadModifierProps> = ({
  modifiers,
  onChange,
  current,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const dropdownItems = modifiers.map((modifier) => (
    <DropdownItem key={modifier} id={modifier}>
      {modifier}
    </DropdownItem>
  ));

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    onChange(event?.currentTarget?.id);
    setOpen(false);
  };

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <DropdownToggle onToggle={() => setOpen(!isOpen)}>
          {current || "Select Modifier"}
        </DropdownToggle>
      }
      isOpen={isOpen}
      dropdownItems={dropdownItems}
    />
  );
};

export default WorkloadCreate;
