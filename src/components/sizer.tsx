import * as React from "react";
import * as Cookies from "js-cookie";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import Planner from "./Planner/planner";
import Results from "./Results/result";
import AboutModal from "./Modals/about";
import FAQModal from "./Modals/faq";
import Header from "./Header/Header";
import { getSizerTour } from "./Tour/Tour";
import { stateReducer, initialState } from "../state";
import "./sizer.css";
import "./shepherd.css";
import GA4React from "ga-4-react";

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

export const Sizer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(1);
  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const [activeModal, setActiveModal] = React.useState("");
  const [isTour, setTour] = React.useState(false);

  const onSelect = (selectedItem: string) => {
    if (selectedItem === "about") {
      setActiveModal("About");
    } else if (selectedItem === "faq") {
      setActiveModal("FAQ");
    }
  };

  React.useEffect(() => {
    if (window.location.search === "") {
      setActiveTab(0);
    }
    if (
      TRACKED_PLATFORMS.includes(window.location.host) &&
      !window.location.pathname.includes(BETA_TAG)
    ) {
      ga4react.initialize();
    }
  }, []);

  React.useEffect(() => {
    const tour = getSizerTour(setTour, setActiveTab, dispatch);
    if (!Cookies.get("SkipTour") && !window.location.search.includes("faq")) {
      setTour(true);
      tour.start();
    } else {
      setTour(false);
    }
  }, []);

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
              onSelect={(_e, tabIndex) => setActiveTab(tabIndex as number)}
            >
              <Tab
                className="sizer-section"
                eventKey={0}
                title={<TabTitleText>Capacity Planning</TabTitleText>}
              >
                <Planner
                  className="sizer-section"
                  state={state}
                  dispatch={dispatch}
                  isTour={isTour}
                />
              </Tab>
              <Tab eventKey={1} title={<TabTitleText>Results</TabTitleText>}>
                <Results state={state} />
              </Tab>
            </Tabs>
          </Route>
        </Switch>
      </Page>
    </Router>
  );
};
