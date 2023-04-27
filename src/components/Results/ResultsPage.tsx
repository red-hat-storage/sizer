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
import {
  addServices,
  addWorkload,
  removeAllNodes,
  removeAllZones,
  setTab,
  setUsableCapacity,
  store,
  Store,
} from "../../redux";
import { GH_TOKEN, ODF_WORKLOAD_NAME } from "../../constants";
import { getLink } from "./util";
import { workloadScheduler } from "../../scheduler/workloadScheduler";
import {
  getDescriptorFromWorkload,
  getWorkloadFromDescriptors,
  isWorkloadSchedulable,
  removeWorkloadSafely,
} from "../../utils/workload";
import { MachineSet, MinimalState, Workload } from "../../types";
import { useODFPresent, useStorageDetails } from "../../hooks";
import UnschedulableWorkload from "./WorkloadSchedulerAlerts";
import { getODFWorkload } from "../../workloads";
import {
  customEventPusher,
  DOWNLOAD_IMAGE,
  GET_SHARING_LINK,
  RESULTS_CLICKED,
  SHOW_ADVANCED,
  useGetAnalyticClientID,
} from "../../analytics";
import { getOCSData, getODFData, StorageClassMap } from "../../utils";
import * as jsyaml from "js-yaml";

const ResultsPage: React.FC = () => {
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
  const [, usedStorage, totalStorage] = useStorageDetails();

  const redirectToStoragePage = () => {
    dispatch(setTab(1));
  };

  const showOverProvisionWarning = isODFPresent && usedStorage > totalStorage;

  React.useEffect(() => {
    dispatch(removeAllZones());
    dispatch(removeAllNodes());
    const unschedulables = [];
    const scheduler = workloadScheduler(store, dispatch);
    const checkSchedulability = isWorkloadSchedulable(services, machineSets);
    const workloadSchedulability: [Workload, boolean, MachineSet[]][] =
      workloads.map((wl) => [wl, ...checkSchedulability(wl)]);
    const usedZonesId: number[] = [];
    workloadSchedulability.forEach((item) => {
      if (item[1]) {
        // Schedule on MachineSets that can run it
        scheduler(item[0], services, item[2], usedZonesId);
      } else {
        unschedulables.push(item[0]);
      }
    });
    setUnschedulableWorkloads(unschedulables);
    // pruneNodes(dispatch)(store.getState().node.nodes, zones);
  }, [dispatch, machineSets, services, workloads]);

  const clientID = useGetAnalyticClientID();
  React.useEffect(() => {
    if (clientID) {
      const params = {
        platform,
        totalStorage: `${totalStorage}`,
        usedStorage: `${usedStorage}`,
        nodes: `${allNodes.length}`,
        totalWorkloads: `${workloads.length}`,
      };
      customEventPusher(RESULTS_CLICKED, params, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
  }, [
    allNodes.length,
    clientID,
    platform,
    totalStorage,
    usedStorage,
    workloads.length,
  ]);

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
    if (clientID) {
      customEventPusher(DOWNLOAD_IMAGE, {}, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
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
  }, [exceptions?.length]);

  const isDownloadButtonVisible = useVisibilityTracker("screenshot-download");
  const scroller = React.useCallback(() => {
    const element = document.getElementById("screenshot-download");
    element?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const onAdvancedButtonClick = (event?: React.FormEvent<React.MouseEvent>) => {
    event?.stopPropagation();
    setShowAdvanced(true);
    if (clientID) {
      customEventPusher(SHOW_ADVANCED, {}, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
  };

  const shouldOpen = () => {
    setVisible(true);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const gistID = urlSearchParams.get("state");
    const MinimalState: MinimalState = {
      workload: coreState.workload
        .filter(
          (wl) =>
            wl.name.toLowerCase() !== "controlplane" &&
            !Object.prototype.hasOwnProperty.call(wl, "duplicateOf")
        )
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

  const updateODFWorkload = React.useCallback(() => {
    dispatch(setUsableCapacity(usedStorage + 5));
    const odfWorkload = getODFWorkload(
      usedStorage + 5,
      ocsState.flashSize,
      ocsState.deploymentType,
      ocsState.dedicatedMachines
    );

    // Remove existing ODF Workload if already present
    const oldWorkload = workloads.find((wl) =>
      wl.name.includes(ODF_WORKLOAD_NAME)
    );
    if (oldWorkload) {
      removeWorkloadSafely(dispatch)(oldWorkload, services);
    }

    const { services: odfServices, workload } =
      getWorkloadFromDescriptors(odfWorkload);

    dispatch(addServices(odfServices));
    dispatch(addWorkload(workload));
  }, [dispatch, usedStorage, ocsState, workloads, services]);

  const pushSharingEvent = () => {
    if (clientID) {
      customEventPusher(GET_SHARING_LINK, {}, clientID).catch((err) =>
        console.error("Error sending data to analytics service", err)
      );
    }
  };

  const downloadCluster = () => {
    const cluster = getOCSData(
      StorageClassMap[platform],
      String(ocsState.usableCapacity),
      null,
      false,
      false,
      null,
      null,
      false,
      "",
      false,
      0,
      false
    );
    const odfSystem = getODFData();
    const clusterYaml = jsyaml.dump(cluster);
    const odfYaml = jsyaml.dump(odfSystem);
    const finalYaml = `${clusterYaml}\n-------------\n${odfYaml}`;
    const link = document.createElement("a");
    const dataStr =
      "data:text/x-yaml;charset=utf-8," + encodeURIComponent(finalYaml);
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "storagecluster.yaml");
    link.click();
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
            Download Cluster Image
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
              id="sharing-link"
              isDisabled={allNodes.length === 0}
              onClick={pushSharingEvent}
            >
              Get Sharing Link
            </Button>
          </Popover>
          {isODFPresent && (
            <Button
              onClick={() => downloadCluster()}
              className="button-normalizer"
            >
              Download Storage Cluster YAML
            </Button>
          )}
        </div>
        <div>
          {!isODFPresent && (
            <Alert
              isInline
              variant="danger"
              title="No Storage Cluster is available"
              actionLinks={
                <>
                  <AlertActionLink onClick={redirectToStoragePage}>
                    Create ODF Cluster
                  </AlertActionLink>
                  <AlertActionLink onClick={createODFWorkload}>
                    Create default ODF Cluster(10 TB)
                  </AlertActionLink>
                </>
              }
            >
              Currently this OCP cluster does not have any ODF storage cluster.
            </Alert>
          )}
        </div>
        <div>
          {unschedulableWorkloads
            .filter((item) => !item?.duplicateOf)
            .map((item) => (
              <UnschedulableWorkload workload={item} key={item.id} />
            ))}
        </div>
        <div>
          {showOverProvisionWarning && (
            <Alert
              isInline
              variant="danger"
              title="ODF Cluster has been overprovisioned"
              actionLinks={
                <>
                  <AlertActionLink onClick={updateODFWorkload}>
                    Increase Cluster Size
                  </AlertActionLink>
                </>
              }
            >
              The workloads require more storage than the capacity of the
              current ODF cluster.
            </Alert>
          )}
        </div>
        <div id="nodes-vis-container">
          <NodesVisualResults nodes={allNodes} />
        </div>
      </div>
    </>
  );
};

export default ResultsPage;
