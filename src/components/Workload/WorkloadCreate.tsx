import * as React from "react";
import * as _ from "lodash";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Alert,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
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
  defaultWorkloadsNameMap,
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
  const dispatch = useDispatch();

  const [isCustom, setCustom] = React.useState(false);
  const [customWorkload, setCustomWorkload] = React.useState<Workload>();

  const onClose = () => {
    setCustom(false);
    dispatch(closeModal());
  };

  const onCreate = (
    workloadName: string,
    workloadModifier: Partial<Workload>,
    workloadObject?: Workload
  ) => () => {
    if (workloadName && workloadModifier) {
      const workload = _.assign(
        {},
        defaultWorkloadsNameMap[workloadName],
        workloadModifier
      );
      dispatch(addWorkload(workload));
    } else if (workloadObject) {
      dispatch(addWorkload(workloadObject));
    }
    onClose();
  };

  const isValid = isValidWorkload(customWorkload as Workload);

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
                          <Button onClick={onCreate(wl.name, modifierObject)}>
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
          <CustomWorkloadCreate setWorkload={setCustomWorkload} />
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

export default WorkloadCreate;
