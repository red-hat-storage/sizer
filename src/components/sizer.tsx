import * as React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
  BrowserRouter,
  HashRouter,
} from "react-router-dom";
import { Page, Spinner } from "@patternfly/react-core";
import { request } from "@octokit/request";
import Header from "./Header/Header";
import {
  store,
  setTab,
  Store,
  clearAllMachines,
  addMachineSet,
  setFlashSize,
  setUsableCapacity,
  setDeploymentType,
  setDedicatedMachines,
  setPlatform,
  setTourActive,
} from "../redux";
import "./sizer.css";
import "./shepherd.css";
import { createWorkload } from "./Workload/create";
import * as _ from "lodash";
import { DeploymentType, MinimalState, Platform } from "../types";
import useAnalytics from "../analytics/analytics";
import { GA4ReactResolveInterface } from "ga-4-react/dist/models/gtagModels";
import { ErrorBoundary, handleLegacyURL, isLegacyURL } from "../utils";
import { getSizerTour } from "./Tour/Tour";
import * as Cookies from "js-cookie";
import { useSetupAPI } from "../api";
import { getODFWorkload } from "../workloads";
import { ODF_DEDICATED_MS_NAME, ODF_WORKLOAD_NAME } from "../constants";
import Navbar from "./Navbar";

const LazyResultsPage = React.lazy(() => import("./Results/ResultsPage"));
const LazyComputePage = React.lazy(() => import("./Compute/ComputePage"));
const LazyWorkloadPage = React.lazy(() => import("./Workload/workloads"));
const LazyStoragePage = React.lazy(() => import("./Storage/StoragePage"));
const LazyAboutModal = React.lazy(() => import("./Modals/about"));
const LazyFAQModal = React.lazy(() => import("./Modals/faq"));

export const GAContext =
  React.createContext<Promise<GA4ReactResolveInterface>>(null);

export const Sizer_: React.FC = () => {
  const dispatch = useDispatch();
  const [activeModal, setActiveModal] = React.useState("");
  const coreState = useSelector((state: Store) => _.omit(state, "ui"));
  const prevState = React.useRef<Omit<Store, "ui">>();

  const analytics = useAnalytics();
  const location = useLocation();
  const navigate = useNavigate();

  useSetupAPI();

  GAContext.displayName = "GAContext";

  const onSelect = (selectedItem: string) => {
    if (selectedItem === "about") {
      setActiveModal("About");
    } else if (selectedItem === "faq") {
      setActiveModal("FAQ");
    }
  };

  React.useEffect(() => {
    if (window.location.search === "") {
      dispatch(setTab(0));
    }

    const refreshListener = (ev) => {
      ev.preventDefault();
      ev.returnValue = "";
    };

    window.addEventListener("beforeunload", refreshListener);
    return () => {
      window.removeEventListener("beforeunload", refreshListener);
    };
  }, [dispatch]);

  const isCompactMode = useSelector(
    (store: Store) => store.cluster.isCompactMode
  );

  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);
    const gistID = urlSearchParams.get("state");
    if (gistID) {
      request("GET /gists/{gist_id}", {
        gist_id: gistID,
      })
        .then((response) => {
          const MinimalState = response.data.files?.["state.json"]?.content;
          const parsedState: MinimalState = JSON.parse(MinimalState || "");

          const workloadCreater = createWorkload(dispatch);
          dispatch(setPlatform(parsedState.platform));
          // Set machineSets
          dispatch(clearAllMachines());
          parsedState.machineSet.forEach((ms) => dispatch(addMachineSet(ms)));
          // Add workloads
          parsedState.workload
            // Todo (bipuladh): Remove this filter statement once we move out of beta.
            .filter((wl) => wl.name.toLowerCase() !== "controlplane")
            .forEach((wl) => workloadCreater(wl));
          // Configure OCS
          dispatch(setFlashSize(parsedState.ocs.flashSize));
          dispatch(setUsableCapacity(parsedState.ocs.usableCapacity));
          dispatch(setDeploymentType(parsedState.ocs.deploymentType));
          dispatch(setDedicatedMachines(parsedState.ocs.dedicatedMachines));
        })
        .catch((err) => console.error(err));
    } else if (isLegacyURL(urlSearchParams)) {
      const {
        platform,
        cpu,
        memory,
        diskSize,
        usableCapacity,
        deploymentType,
        nvmeTuning,
        cephFSActive,
        noobaaActive,
        rgwActive,
      } = handleLegacyURL(urlSearchParams);
      const workloadCreater = createWorkload(dispatch);
      dispatch(setPlatform(platform as Platform));
      dispatch(
        addMachineSet({
          name: ODF_DEDICATED_MS_NAME,
          cpu: Number(cpu),
          memory: Number(memory),
          instanceName: "LEGACY_INSTANCE",
          numberOfDisks: 24,
          onlyFor: [ODF_WORKLOAD_NAME],
          label: "Beta Node",
        })
      );
      const workload = getODFWorkload(
        Number(usableCapacity) / 1024,
        Number(diskSize),
        isCompactMode
          ? DeploymentType.COMPACT
          : (deploymentType as DeploymentType),
        [ODF_DEDICATED_MS_NAME],
        noobaaActive === "true",
        rgwActive === "true",
        cephFSActive === "true",
        nvmeTuning === "true"
      );
      // Configure OCS
      dispatch(setFlashSize(Number(diskSize)));
      dispatch(setUsableCapacity(Number(usableCapacity) / 1024));
      dispatch(setDeploymentType(deploymentType as DeploymentType));
      dispatch(setDedicatedMachines([ODF_DEDICATED_MS_NAME]));
      workloadCreater(workload);
      alert(
        'You are using a legacy URL. This might be unsupported in the upcoming versions so please update your link by going to Results and clicking "Get Sharing Link"'
      );
    }
  }, [dispatch]);

  // Removes search query when the state get's changed.
  React.useEffect(() => {
    if (
      prevState.current &&
      JSON.stringify(prevState.current) !== JSON.stringify(coreState)
    ) {
      navigate(location.pathname);
    }
    prevState.current = coreState;
  }, [coreState, history, location.pathname]);

  React.useEffect(() => {
    const tour = getSizerTour(dispatch);
    if (!Cookies.get("SkipTour") && !location.search.includes("faq")) {
      dispatch(setTourActive(true));
      tour.start();
    } else {
      dispatch(setTourActive(false));
    }
    // This should be only triggered once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const HeaderComponent =
    process.env.DEPLOYMENT_MODE !== "lab" ? (
      <Header onSelect={onSelect} />
    ) : null;

  return (
    <GAContext.Provider value={analytics}>
      <Page header={HeaderComponent} className="sizer-page">
        <Navbar />
        <React.Suspense fallback={<Spinner isSVG aria-label="Basic Spinner" />}>
          <LazyAboutModal
            isOpen={activeModal === "About"}
            onClose={() => setActiveModal("")}
          />
          <LazyFAQModal
            isOpen={activeModal === "FAQ"}
            onClose={() => setActiveModal("")}
          />
          <Routes>
            <Route path="/workloads" element={<LazyWorkloadPage />} />
            <Route path="/storage" element={<LazyStoragePage />} />
            <Route path="/compute" element={<LazyComputePage />} />
            <Route path="/results" element={<LazyResultsPage />} />
            <Route path="/" element={<Navigate to="/workloads" />} />
          </Routes>
        </React.Suspense>
      </Page>
    </GAContext.Provider>
  );
};

const IS_BETA = process.env.PUBLIC_PATH === "/sizer.ocs.ninja/beta/";
const BETA_BASE = "/sizer.ocs.ninja/beta";

export const Sizer: React.FC = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <HashRouter>
        <Sizer_ />
      </HashRouter>
    </ErrorBoundary>
  </Provider>
);
