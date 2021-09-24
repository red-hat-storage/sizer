import * as React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { request } from "@octokit/request";
import Planner from "./Planner/planner";
import Results from "./Results/result";
import AboutModal from "./Modals/about";
import FAQModal from "./Modals/faq";
import Header from "./Header/Header";
import {
  store,
  setTab,
  Store,
  clearAllMachines,
  addMachineSet,
  addWorkload,
  setFlashSize,
  setUsableCapacity,
  setDeploymentType,
  setDedicatedMachines,
} from "../redux";
import "./sizer.css";
import "./shepherd.css";
import GA4React from "ga-4-react";
import Compute from "./Compute/compute";
import WorkloadPage from "./Workload/workloads";
import * as _ from "lodash";

const TRACKED_PLATFORMS = [
  "sizer.odf.ninja",
  "sizer.ocs.ninja",
  "storage.googleapis.com",
  "access.redhat.com",
];
const BETA_TAG = "/beta/";
const ga4react = new GA4React(process.env.GAKEY || "", {
  send_page_view: true,
});

export const Sizer_: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: Store) => state.ui.activeTab);
  const [activeModal, setActiveModal] = React.useState("");
  const coreState = useSelector((state: Store) => _.omit(state, "ui"));
  const prevState = React.useRef<Omit<Store, "ui">>();

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
    if (
      TRACKED_PLATFORMS.includes(window.location.host) &&
      !window.location.pathname.includes(BETA_TAG)
    ) {
      ga4react.initialize();
    }
  }, []);

  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const gistID = urlSearchParams.get("state");
    if (gistID) {
      request("GET /gists/{gist_id}", {
        gist_id: gistID,
      })
        .then((response) => {
          const serializedState = response.data.files?.["state.json"]?.content;
          const parsedState: Omit<Store, "ui"> = JSON.parse(
            serializedState || ""
          );
          // Set machineSets
          dispatch(clearAllMachines());
          parsedState.machineSet.forEach((ms) => dispatch(addMachineSet(ms)));
          // Add workloads
          parsedState.workload.forEach((wl) => dispatch(addWorkload(wl)));
          // Configure OCS
          dispatch(setFlashSize(parsedState.ocs.flashSize));
          dispatch(setUsableCapacity(parsedState.ocs.usableCapacity));
          dispatch(setDeploymentType(parsedState.ocs.deploymentType));
          dispatch(setDedicatedMachines(parsedState.ocs.dedicatedMachines));
        })
        .catch((err) => console.log(err));
    }
  }, []);

  // Removes search query when the state get's changed.
  React.useEffect(() => {
    if (
      prevState.current &&
      JSON.stringify(prevState.current) !== JSON.stringify(coreState)
    ) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    prevState.current = coreState;
  }, [JSON.stringify(coreState)]);

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
    <Router>
      <Page header={HeaderComponent} className="sizer-page">
        <AboutModal
          isOpen={activeModal === "About"}
          onClose={() => setActiveModal("")}
        />
        <FAQModal
          isOpen={activeModal === "FAQ"}
          onClose={() => setActiveModal("")}
        />
        <Switch>
          <Route path="/">
            <Tabs
              activeKey={activeTab}
              onSelect={(_e, tabIndex) => dispatch(setTab(tabIndex as number))}
            >
              <Tab eventKey={0} title={<TabTitleText>Compute</TabTitleText>}>
                <Compute />
              </Tab>
              <Tab
                className="sizer-section"
                eventKey={1}
                title={<TabTitleText>Storage</TabTitleText>}
              >
                <Planner />
              </Tab>
              <Tab eventKey={2} title={<TabTitleText>Workloads</TabTitleText>}>
                <WorkloadPage />
              </Tab>
              <Tab eventKey={3} title={<TabTitleText>Results</TabTitleText>}>
                <Results />
              </Tab>
            </Tabs>
          </Route>
        </Switch>
      </Page>
    </Router>
  );
};

export const Sizer: React.FC = () => (
  <Provider store={store}>
    <Sizer_ />
  </Provider>
);
