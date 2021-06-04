import * as React from "react";
import Conv from "html2canvas";
import { Button } from "@patternfly/react-core";
import Cluster from "../../models/Cluster";
import Disk from "../../models/Disk";
import { Node } from "../../models/Node";
import { DeploymentDetails, State } from "../../types";
import AdvancedResultsModal from "../Modals/AdvancedResults";
import SupportExceptionModal from "../Modals/SupportException";
import NodesVisualResults from "./NodeResults";
import ExceptionAlert from "../Exception/Exception";
import GeneralResults from "./GeneralResults";
import { getSupportExceptions } from "../Exception/utils";
import { useVisibilityTracker } from "../../hooks/view";
import SkipToTop from "./SkipToTop";
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
  const [showExceptionModal, setShowExceptionModal] = React.useState(false);
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
    if (flashSize !== 0 && usableCapacity !== 0) {
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
    }
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

  const allNodes = processedValues?.replicaSets?.reduce(
    (acc, curr) => [...acc, ...curr.nodes],
    [] as Node[]
  );

  const screenshot = () => {
    const link = document.createElement("a");
    link.download = "ODF-Sizer.png";
    const ref = document.getElementById("nodes-vis-container");
    Conv(ref as HTMLDivElement).then((c) => {
      c.id = "download-canvas";
      c.setAttribute("style", "display: none");
      link.href = c.toDataURL();
      link.click();
    });
  };

  const exceptions = React.useMemo(() => getSupportExceptions(state), [
    JSON.stringify(state),
  ]);

  React.useEffect(() => {
    if (exceptions?.length > 0) {
      setShowExceptionModal(true);
    } else {
      setShowExceptionModal(false);
    }
  }, [JSON.stringify(exceptions)]);

  const isDownloadButtonVisible = useVisibilityTracker("screenshot-download");
  const scroller = React.useCallback(() => {
    const element = document.getElementById("screenshot-download");
    element?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const onAdvancedButtonClick = (event?: React.FormEvent<React.MouseEvent>) => {
    event?.stopPropagation();
    setShowAdvanced(true);
  };

  return (
    <>
      {!isDownloadButtonVisible && <SkipToTop onClick={scroller} />}
      <AdvancedResultsModal
        onClose={() => setShowAdvanced(false)}
        isOpen={showAdvanced}
        replicaSets={processedValues.replicaSets}
      />
      {/* Todo(bipuladh): There is no specific need for this component to be tied to results page */}
      <SupportExceptionModal
        exceptions={exceptions}
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
      />
      <div className="results-wrapper">
        <div id="support-exception">
          <ExceptionAlert state={state} />
        </div>
        <div>
          <GeneralResults {...processedValues} />
        </div>
        <div className="button-bar">
          <Button
            id="advanced-results-button"
            className="button-normalizer"
            onClick={onAdvancedButtonClick as any}
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
