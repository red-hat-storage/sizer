import * as React from "react";
import * as _ from "lodash";
import { useSelector } from "react-redux";
import Conv from "html2canvas";
import { request } from "@octokit/request";
import {
  Button,
  ClipboardCopy,
  Popover,
  Spinner,
} from "@patternfly/react-core";
import Cluster from "../../models/Cluster";
import { Node } from "../../models/Node";
import AdvancedResultsModal from "../Modals/AdvancedResults";
import SupportExceptionModal from "../Modals/SupportException";
import NodesVisualResults from "./NodeResults";
import ExceptionAlert from "../Exception/Exception";
import GeneralResults from "./GeneralResults";
import { getSupportExceptions } from "../Exception/utils";
import { useVisibilityTracker } from "../../hooks/view";
import SkipToTop from "./SkipToTop";
import "./result.css";
import { Store } from "../../redux";
import { GH_TOKEN } from "../../constants";

const Results: React.FC = () => {
  const ocsState = useSelector((store: Store) => store.ocs);
  const workloads = useSelector((store: Store) => store.workload);
  const machineSets = useSelector((store: Store) => store.machineSet);
  const platform = useSelector((store: Store) => store.cluster.platform);
  const coreState = useSelector((store: Store) => _.omit(store, "ui"));

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showExceptionModal, setShowExceptionModal] = React.useState(false);
  const [link, setLink] = React.useState("");
  // Handles popover visibility
  const [isVisible, setVisible] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  const cluster = React.useMemo(() => new Cluster(platform), [platform]);

  React.useEffect(() => {
    cluster.setMachineSetsAndWorkloads(machineSets, workloads);
  }, [machineSets, workloads, cluster]);

  const allNodes = cluster?.zones?.reduce(
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

  const exceptions = React.useMemo(
    () =>
      getSupportExceptions(
        ocsState.flashSize,
        platform,
        ocsState.deploymentType
      ),
    [ocsState.flashSize, platform, ocsState.deploymentType]
  );

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

  const shouldOpen = () => {
    setVisible(true);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const gistID = urlSearchParams.get("state");
    if (gistID) {
      setLink(gistID);
    } else {
      setLoading(true);
      // Create a gist from the state
      const fileName = "state.json";
      request("POST /gists", {
        headers: {
          authorization: `token ${GH_TOKEN}`,
        },
        files: {
          [fileName]: {
            content: JSON.stringify(coreState, null, 2),
          },
        },
        public: true,
      })
        .then((response) => {
          setLink(response.data.id || "");
          setLoading(false);
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname.substring(
              0,
              window.location.pathname.length - 1
            )}?state=${response.data.id}`
          );
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  return (
    <>
      {!isDownloadButtonVisible && <SkipToTop onClick={scroller} />}
      <AdvancedResultsModal
        onClose={() => setShowAdvanced(false)}
        isOpen={showAdvanced}
        zones={cluster.zones}
      />
      {/* Todo(bipuladh): There is no specific need for this component to be tied to results page */}
      <SupportExceptionModal
        exceptions={exceptions}
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
      />
      <div className="page--margin">
        <div id="support-exception">
          <ExceptionAlert
            platform={platform}
            flashSize={ocsState.flashSize}
            deployment={ocsState.deploymentType}
          />
        </div>
        <div>
          <GeneralResults {...cluster.getDetails()} />
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
          <Popover
            isVisible={isVisible}
            shouldOpen={shouldOpen}
            shouldClose={() => setVisible(false)}
            bodyContent={
              isLoading ? (
                <div>
                  <Spinner isSVG />
                </div>
              ) : (
                <div>
                  <div>
                    You can use the following link to share your configuration:{" "}
                  </div>
                  <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                    {`${
                      window.location.origin
                    }${window.location.pathname.substring(
                      0,
                      window.location.pathname.length - 1
                    )}?state=${link}`}
                  </ClipboardCopy>
                </div>
              )
            }
          >
            <Button className="button-normalizer">Get Sharing Link</Button>
          </Popover>
        </div>
        <div id="nodes-vis-container">
          <NodesVisualResults nodes={allNodes} />
        </div>
      </div>
    </>
  );
};

export default Results;
