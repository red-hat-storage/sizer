import * as React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Spinner, Tab, Tabs, TabTitleText } from "@patternfly/react-core";
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
} from "../redux";
import "./sizer.css";
import "./shepherd.css";
import { createWorkload } from "./Workload/create";
import * as _ from "lodash";
import { MinimalState } from "../types";
import useAnalytics from "../analytics/analytics";
import { GA4ReactResolveInterface } from "ga-4-react/dist/models/gtagModels";
import ErrorBoundary from "../utils/ErrorBoundary";

const LazyResultsPage = React.lazy(() => import("./Results/ResultsPage"));
const LazyComputePage = React.lazy(() => import("./Compute/ComputePage"));
const LazyWorkloadPage = React.lazy(() => import("./Workload/workloads"));
const LazyStoragePage = React.lazy(() => import("./Storage/StoragePage"));
const LazyAboutModal = React.lazy(() => import("./Modals/about"));
const LazyFAQModal = React.lazy(() => import("./Modals/faq"));

export const GAContext = React.createContext<Promise<GA4ReactResolveInterface>>(
  null
);

export const Sizer_: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: Store) => state.ui.activeTab);
  const [activeModal, setActiveModal] = React.useState("");
  const coreState = useSelector((state: Store) => _.omit(state, "ui"));
  const prevState = React.useRef<Omit<Store, "ui">>();

  const analytics = useAnalytics();

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

  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
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
            .filter((wl) => wl.name !== "ControlPlane")
            .forEach((wl) => workloadCreater(wl));
          // Configure OCS
          dispatch(setFlashSize(parsedState.ocs.flashSize));
          dispatch(setUsableCapacity(parsedState.ocs.usableCapacity));
          dispatch(setDeploymentType(parsedState.ocs.deploymentType));
          dispatch(setDedicatedMachines(parsedState.ocs.dedicatedMachines));
        })
        .catch((err) => console.error(err));
    }
  }, [dispatch]);

  // Removes search query when the state get's changed.
  React.useEffect(() => {
    if (
      prevState.current &&
      JSON.stringify(prevState.current) !== JSON.stringify(coreState)
    ) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    prevState.current = coreState;
  }, [coreState]);

  /*   React.useEffect(() => {
    const tour = getSizerTour(dispatch);
    if (!Cookies.get("SkipTour") && !window.location.search.includes("faq")) {
      dispatch(setTourActive(true));
      tour.start();
    } else {
      dispatch(setTourActive(false));
    }
  }, []);
 */

  const HeaderComponent =
    process.env.DEPLOYMENT_MODE !== "lab" ? (
      <Header onSelect={onSelect} />
    ) : null;

  return (
    <GAContext.Provider value={analytics}>
      <Router>
        <Page header={HeaderComponent} className="sizer-page">
          <React.Suspense
            fallback={<Spinner isSVG aria-label="Basic Spinner" />}
          >
            <LazyAboutModal
              isOpen={activeModal === "About"}
              onClose={() => setActiveModal("")}
            />
          </React.Suspense>
          <React.Suspense
            fallback={<Spinner isSVG aria-label="Basic Spinner" />}
          >
            <LazyFAQModal
              isOpen={activeModal === "FAQ"}
              onClose={() => setActiveModal("")}
            />
          </React.Suspense>
          <Switch>
            <Route path="/">
              <ErrorBoundary>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(_e, tabIndex) =>
                    dispatch(setTab(tabIndex as number))
                  }
                  unmountOnExit
                  mountOnEnter
                >
                  <Tab
                    eventKey={0}
                    title={<TabTitleText>Workloads</TabTitleText>}
                  >
                    <React.Suspense
                      fallback={<Spinner isSVG aria-label="Basic Spinner" />}
                    >
                      <LazyWorkloadPage />
                    </React.Suspense>
                  </Tab>
                  <Tab
                    className="sizer-section"
                    eventKey={1}
                    title={<TabTitleText>Storage</TabTitleText>}
                  >
                    <React.Suspense
                      fallback={<Spinner isSVG aria-label="Basic Spinner" />}
                    >
                      <LazyStoragePage />
                    </React.Suspense>
                  </Tab>
                  <Tab
                    eventKey={2}
                    title={<TabTitleText>Compute</TabTitleText>}
                  >
                    <React.Suspense
                      fallback={<Spinner isSVG aria-label="Basic Spinner" />}
                    >
                      <LazyComputePage />
                    </React.Suspense>
                  </Tab>
                  <Tab
                    eventKey={3}
                    title={<TabTitleText>Results</TabTitleText>}
                  >
                    <React.Suspense
                      fallback={<Spinner isSVG aria-label="Basic Spinner" />}
                    >
                      <LazyResultsPage />
                    </React.Suspense>
                  </Tab>
                </Tabs>
              </ErrorBoundary>
            </Route>
          </Switch>
        </Page>
      </Router>
    </GAContext.Provider>
  );
};

export const Sizer: React.FC = () => (
  <Provider store={store}>
    <Sizer_ />
  </Provider>
);
