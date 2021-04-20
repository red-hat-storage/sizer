import * as React from "react";
import Conv from "html2canvas";
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Button,
} from "@patternfly/react-core";
import Cluster from "../../models/Cluster";
import Disk from "../../models/Disk";
import { Node } from "../../models/Node";
import { DeploymentDetails, State } from "../../types";
import AdvancedResultsModal from "../Modals/AdvancedResults";
import SupportExceptionModal from "../Modals/SupportException";
import NodesVisualResults from "./NodeResults";
import { needsSupportException, SupportExceptionObject } from "./utils";
import GeneralResults from "./GeneralResults";
import "./result.css";

type ResultsProps = {
  state: State;
};

const Results: React.FC<ResultsProps> = (props) => {
  const { state } = props;
  const [
    processedValues,
    setProcessedValues,
  ] = React.useState<DeploymentDetails>({} as DeploymentDetails);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showSupportException, setShowSupportException] = React.useState(false);

  const {
    platform,
    deploymentType,
    usableCapacity,
    nodeCPU,
    nodeMemory,
    cephFSActive,
    nooBaaActive,
    rgwActive,
    nvmeTuning,
    flashSize,
  } = state;
  React.useEffect(() => {
    const temp = new Cluster(
      platform,
      deploymentType,
      new Disk(flashSize),
      usableCapacity,
      nodeCPU,
      nodeMemory,
      cephFSActive,
      nooBaaActive,
      rgwActive,
      nvmeTuning
    );
    setProcessedValues(temp.getDetails());
  }, [
    platform,
    deploymentType,
    usableCapacity,
    nodeCPU,
    nodeMemory,
    cephFSActive,
    nooBaaActive,
    rgwActive,
    nvmeTuning,
    flashSize,
  ]);

  const { issue, header, message } = React.useMemo(
    () => needsSupportException(state),
    [state]
  );

  React.useEffect(() => {
    if (issue != null) {
      setShowSupportException(true);
    }
  }, [issue]);

  const allNodes = processedValues?.replicaSets?.reduce(
    (acc, curr) => [...acc, ...curr.nodes],
    [] as Node[]
  );
  const screenshot = () => {
    const link = document.createElement("a");
    link.download = "OCS-Sizer.png";
    const ref = document.getElementById("nodes-vis-container");
    Conv(ref as HTMLDivElement).then((c) => {
      c.id = "download-canvas";
      c.setAttribute("style", "display: none");
      link.href = c.toDataURL();
      link.click();
    });
  };
  return (
    <>
      <AdvancedResultsModal
        onClose={() => setShowAdvanced(false)}
        isOpen={showAdvanced}
        replicaSets={processedValues.replicaSets}
      />
      <SupportExceptionModal
        onClose={() => setShowSupportException(false)}
        isOpen={showSupportException}
        header={header}
        message={message}
      />
      <div className="results-wrapper">
        <div id="support-exception">
          <SupportException issue={issue} header={header} message={message} />
        </div>
        <div>
          <GeneralResults {...processedValues} />
        </div>
        <div className="button-bar">
          <Button
            id="advanced-results-button"
            className="button-normalizer"
            onClick={() => setShowAdvanced((show) => !show)}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Button>
          <Button
            id="screenshot-download"
            className="button-normalizer"
            onClick={() => screenshot()}
          >
            Download
          </Button>
        </div>
        <div id="nodes-vis-container">
          <NodesVisualResults nodes={allNodes} />
        </div>
      </div>
    </>
  );
};

export default Results;

const SupportException: React.FC<SupportExceptionObject> = ({
  issue,
  header,
  message,
}) => {
  const [isOpen, setOpen] = React.useState(true);
  React.useEffect(() => {
    setOpen(true);
  }, [issue, header, message]);

  return isOpen && issue !== undefined ? (
    <Alert
      isInline
      variant="warning"
      title={header}
      actionLinks={
        <AlertActionLink
          onClick={() =>
            window.location.assign("https://access.redhat.com/articles/5001441")
          }
        >
          Check Support Matrix
        </AlertActionLink>
      }
    >
      <div>
        <div>{message}</div>
        <div>
          This cluster is not within the regular support limits. You will need a
          support exception!
        </div>
      </div>
    </Alert>
  ) : (
    <></>
  );
};
