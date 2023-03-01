import Shepherd from "shepherd.js";
import * as Cookies from "js-cookie";
import { setFlashSize, setTab, setTourActive } from "../../redux";
import { Dispatch } from "@reduxjs/toolkit";

type GetSizeTour = (dispatch: Dispatch) => Shepherd.Tour;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const doesElementExist = (element) =>
  document.querySelector(`${element}`) !== null;

const generateTabId = (id: string, key: number) => `#pf-tab-${key}-${id}`;

export const getSizerTour: GetSizeTour = (dispatch) => {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      scrollTo: true,
      classes: "shadow-md bg-purple-dark",
    },
    useModalOverlay: true,
    confirmCancel: true,
    confirmCancelMessage:
      "You can cancel now, but will need to finish the tour on your next visit",
  });

  tour.on("complete", () => {
    console.debug("Tour completed, setting cookie");
    Cookies.set("SkipTour", "true");
    dispatch(setTourActive(false));
  });

  tour.on("cancel", () => {
    dispatch(setTourActive(false));
  });

  tour.addSteps([
    {
      title: "Welcome to the Sizer",
      text: "Configure your Workloads </br>and see your required cluster and storage size",
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      title: "The main navigation",
      text: "Use the tabs to navigate between defining your <b>Workloads</b>, configuring required <b>Storage</b>, setting your desired <b>Compute</b> sizes and to view your current Sizer <b>Results</b>",
      attachTo: {
        element: ".pf-c-tabs",
        on: "bottom",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      title: "Workloads",
      text: "On this page you add your list of Applications that will run on your cluster. We have some common use cases ready as Templates. Defining custom Workloads is also possible.",
      attachTo: {
        element: generateTabId("workloads-tab", 0),
        on: "bottom",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      title: "Storage",
      text: "Here you define the OpenShift Data Foundation installation which will add persistent storage to your Workloads.",
      attachTo: {
        element: generateTabId("storage-tab", 1),
        on: "top",
      },
      beforeShowPromise: async () => {
        dispatch(setTab(1));
        while (!doesElementExist("#create-odf")) {
          await sleep(100);
        }
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "The most important input on this page is the usable storage capacity.",
      attachTo: {
        element: "#usable-input",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "Some Workloads estimate their required capacity to help you size the storage cluster properly.",
      attachTo: {
        element: ".pf-c-chart",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      beforeShowPromise: async () => {
        dispatch(setTab(2));
        while (!doesElementExist("#create-ms")) {
          await sleep(100);
        }
      },
      title: "Compute",
      text: "On this page you can set your instance sizes that make up your OpenShift cluster. We have instance sizes for the most popular public clouds built in, otherwise you can use the BareMetal configuration.",
      attachTo: {
        element: generateTabId("compute-tab", 2),
        on: "bottom",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "Chose your Platform here. If your target Platform is not in the list, try using the BareMetal option.",
      attachTo: {
        element: "#platform-selector",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      beforeShowPromise: async () => {
        dispatch(setTab(3));
        while (!doesElementExist("#sharing-link")) {
          await sleep(100);
        }
      },
      title: "Results",
      attachTo: {
        element: generateTabId("results-tab", 3),
        on: "bottom",
      },
      text: "Generic information on how we calculate the cluster will be visible here and auto-update when you change inputs on the other tabs.",
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      beforeShowPromise: async () => {
        dispatch(setTab(3));
        // Set State to make the cluster out of regular support size
        dispatch(setFlashSize(6));
        while (!doesElementExist("#support-exception-modal")) {
          await sleep(100);
        }
      },
      text: "If your configuration is out of the regular support limits, we will warn you on the Results page",
      attachTo: {
        element: "#support-exception-modal",
        on: "bottom",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
      when: {
        hide: () => {
          // Revert it to original State
          dispatch(setFlashSize(2.5));
          dispatch(setTab(1));
        },
      },
    },
    {
      beforeShowPromise: async () => {
        dispatch(setTab(3));
        while (!doesElementExist("#sharing-link")) {
          await sleep(100);
        }
      },
      title: "Sharing",
      attachTo: {
        element: "#sharing-link",
        on: "top",
      },
      text: "Clicking on this button will generate a link that you can use to share this exact configuration with your peers.",
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "This button will open up the advanced view, usually reserved for debugging placement issues of Workloads on Machines.",
      attachTo: {
        element: "#advanced-results-button",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: 'Down here you see a visual representation of your planned OpenShift cluster. You can download this as a picture by clicking on the "Download Cluster Image" button.',
      attachTo: {
        element: "#nodes-vis-container",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "Nodes in the same column are in the same availability zone. We count them up within their zone.</br>You will also see the instance size in public clouds here.",
      attachTo: {
        element: ".card-container__title",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "Below the title we display the name of the Machine Set that deployed this node for your Workloads.",
      attachTo: {
        element: "#instance-type",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "This counts the number of local disks dedicated to the Storage Cluster.",
      attachTo: {
        element: ".card-container-disk-section__count",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "These bars show you how much CPU and Memory is used up by the Workloads and Cluster Services.<br><br>Be aware that these numbers are just estimations that also rely on the placement of the Pods in your deployment as OpenShift might schedule them differently.",
      attachTo: {
        element: "#resource-bars",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "At the bottom we show the total available CPU and Memory on this Machine.",
      attachTo: {
        element: ".pf-c-card__footer",
        on: "top",
      },
      buttons: [
        {
          text: "Skip Tour",
          action: tour.cancel,
        },
        {
          text: "Next",
          action: tour.next,
        },
      ],
    },
    {
      text: "You can download a cluster picture here. Use this in your report or slides",
      attachTo: {
        element: "#screenshot-download",
        on: "top",
      },
      buttons: [
        {
          text: "Finish",
          action: tour.complete,
        },
      ],
    },
  ]);
  return tour;
};
