import * as React from "react";
import * as _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import Conv from "html2canvas";
import { request } from "@octokit/request";
import {
  Alert,
  AlertActionLink,
  Button,
  ClipboardCopy,
  Popover,
  Spinner,
} from "@patternfly/react-core";
import AdvancedResultsModal from "../Modals/AdvancedResults";
import SupportExceptionModal from "../Modals/SupportException";
import NodesVisualResults from "./NodeResults";
import ExceptionAlert from "../Exception/Exception";
import GeneralResults from "./GeneralResults";
import { getSupportExceptions } from "../Exception/utils";
import { useVisibilityTracker } from "../../hooks/view";
import SkipToTop from "./SkipToTop";
import "./result.css";
import { removeAllNodes, removeAllZones, store, Store } from "../../redux";
import { GH_TOKEN } from "../../constants";
import { getLink } from "./util";
import { workloadScheduler } from "../../scheduler/workloadScheduler";
import { pruneNodes } from "../../scheduler/nodePruner";
import {
  getDescriptorFromWorkload,
  isWorkloadSchedulable,
} from "../../utils/workload";
import { MachineSet, MinimalState, Workload } from "../../types";
import { useODFPresent } from "../../hooks";
import UnschedulableWorkload from "./WorkloadSchedulerAlerts";

const Results: React.FC = () => {
  const {
    ocsState,
    workloads,
    machineSets,
    platform,
    allNodes,
    zones,
    services,
  } = useSelector((store: Store) => ({
    ocsState: store.ocs,
    workloads: store.workload,
    machineSets: store.machineSet,
    platform: store.cluster.platform,
    allNodes: store.node.nodes,
    zones: store.zone.zones,
    services: store.service.services,
  }));
  const coreState = useSelector((store: Store) => _.omit(store, "ui"));
  const dispatch = useDispatch();
  const [unschedulableWorkloads, setUnschedulableWorkloads] = React.useState<
    Workload[]
  >([]);
  const [isODFPresent, createODFWorkload] = useODFPresent();

  React.useEffect(() => {
    dispatch(removeAllZones());
    dispatch(removeAllNodes());
    const unschedulables = [];
    /*     const scheduledServiceIDs: number[] = _.flatten(
      allNodes.map((node) => node.services)
    );
    const candidateWorkloads: Workload[] = workloads.filter(
      (wl) => _.intersection(scheduledServiceIDs, wl.services).length === 0
    ); */
    const scheduler = workloadScheduler(store, dispatch);
    const checkSchedulability = isWorkloadSchedulable(services, machineSets);
    const workloadSchedulability: [Workload, boolean, MachineSet[]][] =
      workloads.map((wl) => [wl, ...checkSchedulability(wl)]);
    workloadSchedulability.forEach((item) => {
      if (item[1]) {
        // Schedule on MachineSets that can run it
        scheduler(item[0], services, item[2]);
      } else {
        unschedulables.push(item[0]);
      }
    });
    setUnschedulableWorkloads(unschedulables);
    // pruneNodes(dispatch)(store.getState().node.nodes, zones);
  }, [JSON.stringify(workloads), JSON.stringify(machineSets)]);

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showExceptionModal, setShowExceptionModal] = React.useState(false);
  const [link, setLink] = React.useState("");
  // Handles popover visibility
  const [isVisible, setVisible] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

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
    const MinimalState: MinimalState = {
      workload: coreState.workload
        .filter((wl) => wl.name !== "controlPlane")
        .map((wl) => getDescriptorFromWorkload(wl, coreState.service.services)),
      machineSet: coreState.machineSet,
      ocs: coreState.ocs,
      platform: coreState.cluster.platform,
    };
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
            content: JSON.stringify(MinimalState, null, 2),
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
            getLink(
              window.location.origin,
              window.location.pathname,
              response.data.id as string
            )
          );
        })
        .catch((err) => {
          console.error(err);
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
        zones={zones}
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
          <GeneralResults isODFPresent={isODFPresent} />
        </div>
        <div className="button-bar">
          <Button
            id="advanced-results-button"
            className="button-normalizer"
            onClick={onAdvancedButtonClick as any}
            isDisabled={allNodes.length === 0}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Button>
          <Button
            id="screenshot-download"
            className="button-normalizer"
            onClick={() => screenshot()}
            isDisabled={allNodes.length === 0}
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
                    {getLink(
                      window.location.origin,
                      window.location.pathname,
                      link
                    )}
                  </ClipboardCopy>
                </div>
              )
            }
          >
            <Button
              className="button-normalizer"
              isDisabled={allNodes.length === 0}
            >
              Get Sharing Link
            </Button>
          </Popover>
        </div>
        <div>
          {!isODFPresent && (
            <Alert
              isInline
              variant="danger"
              title={`No Storage Cluster is available`}
              actionLinks={
                <>
                  <AlertActionLink onClick={createODFWorkload}>
                    Create ODF Cluster
                  </AlertActionLink>
                </>
              }
            >
              Currently this OCP cluster doesn't have any ODF storage cluster.
            </Alert>
          )}
        </div>
        <div>
          {unschedulableWorkloads.map((item) => (
            <UnschedulableWorkload workload={item} key={item.id} />
          ))}
        </div>
        <div id="nodes-vis-container">
          <NodesVisualResults nodes={allNodes} />
        </div>
      </div>
    </>
  );
};

export default Results;
