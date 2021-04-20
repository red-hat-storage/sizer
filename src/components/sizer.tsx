import * as React from "react";
import * as Cookies from "js-cookie";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import Planner from "./Planner/planner";
import Results from "./Results/result";
import AboutModal from "./Modals/about";
import FAQ from "./FAQ/faq";
import Header from "./Header/Header";
import { getSizerTour } from "./Tour/Tour";
import { stateReducer, initialState } from "../state";
import "./sizer.css";
import "./shepherd.css";

export const Sizer: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(1);
  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isTour, setTour] = React.useState(false);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    if (event?.currentTarget?.id === "about") {
      setModalOpen(true);
    }
  };

  React.useEffect(() => {
    const tour = getSizerTour(setTour, setActiveTab, dispatch);
    if (!Cookies.get("SkipTour") && !window.location.pathname.includes("faq")) {
      setTour(true);
      tour.start();
    } else {
      setTour(false);
    }
  }, []);

  return (
    <Router>
      <Page header={<Header onSelect={onSelect} />} className="sizer-page">
        <AboutModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        <Switch>
          <Route exact path="/">
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
          <Route path="/faq">
            <FAQ />
          </Route>
        </Switch>
      </Page>
    </Router>
  );
};
