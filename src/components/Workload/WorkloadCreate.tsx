import * as React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { Alert, Modal } from "@patternfly/react-core";
import { useDispatch, useSelector } from "react-redux";
import { addWorkload, closeModal, Store } from "../../redux";
import * as jsyaml from "js-yaml";
import { Workload } from "../../models";
import { Button } from "@patternfly/react-code-editor/node_modules/@patternfly/react-core";

/**
 * Example Workload (YAML)
 * 
name: tester
count: 3
usesMachine:
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

const WorkloadCreate: React.FC = () => {
  const openModal = useSelector((store: Store) => store.ui.openModal);
  const dispatch = useDispatch();

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  const onCreate = () => {
    try {
      const model = jsyaml.load(code, { json: true });
      dispatch(addWorkload(model as Workload));
      onClose();
    } catch (e) {
      setError(String(e));
    }
  };

  const onClose = () => dispatch(closeModal());

  const onEditorMount = (editor: any, monaco: any) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };
  return (
    <Modal
      title="Create a Workload"
      isOpen={WL_MODAL_ID === openModal}
      onClose={onClose}
      height="88vh"
      width="60vw"
      actions={[
        <Button variant="primary" key="create" onClick={onCreate}>
          Create
        </Button>,
      ]}
    >
      <CodeEditor
        isDarkTheme={true}
        isLineNumbersVisible={true}
        isMinimapVisible={true}
        isLanguageLabelVisible
        code={code}
        onChange={(val) => setCode(val as string)}
        language={Language.yaml}
        onEditorDidMount={onEditorMount}
        height="60vh"
      />
      {error && (
        <Alert variant="danger" isInline title="Error parsing YAML">
          {error}
        </Alert>
      )}
    </Modal>
  );
};

export default WorkloadCreate;
