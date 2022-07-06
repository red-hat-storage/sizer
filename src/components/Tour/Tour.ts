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
      title: "Welcome to the ODF Sizer",
      text: "This tool supports ODF 4.5 onwards",
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
      title: "The layout",
      text: "ODF sizer has four tabs. These four tabs are Workloads, Storage, Compute and Results",
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
      text: "This page allows you to create workloads to simulate on this OCP cluster.",
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
      text: "This page allows you to create an ODF storage cluster.",
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
      text: "Now select how large each disk is. We assume all disks will be of equal size.",
      attachTo: {
        element: "#flash-input",
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
      text: "At last, chose how much usable capacity you need. This will be the total usable cluster capacity in the ODF cluster",
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
      beforeShowPromise: async () => {
        dispatch(setTab(3));
        // Set State to make the cluster out of regular support size
        dispatch(setFlashSize(6));
        while (!doesElementExist("#support-exception-modal")) {
          await sleep(100);
        }
      },
      text: "When your configuration is out of the regular support limits, we will show a modal here",
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
        dispatch(setTab(2));
        while (!doesElementExist("#create-ms")) {
          await sleep(100);
        }
      },
      title: "Compute",
      text: "This page allows you to create MachineSets to simulate Nodes on this OCP cluster.",
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
      text: "Chose your Platform here. Note that some Platforms are in tech-preview",
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
      text: "Generic information on how we calculate the cluster will be visible here and auto-update when you change the state",
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
      title: "Sharing",
      attachTo: {
        element: "#sharing-link",
        on: "top",
      },
      text: "You can click on this button to generate the sharing link for your configuration.",
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
      text: "A more advanced output that includes a view into how we distributed the ODF base service Pods can be toggled with this button.",
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
      text: "Finally down here you see your cluster as a picture that you can share. Each column represents a distinct availability zone.",
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
      text: "Each node has the same size, which is displayed here. For public cloud deployments we display our instance type recommendation.",
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
      text: "Here we show how many disks will be used on this node. The amount of disks may vary between rows of nodes.",
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
      text: "These bars show you how much CPU and Memory is used up by this deployment. It will estimate what ODF will use up and for compact mode also estimate what OCP will use up at least. <br>If you hover over the bars, it will show more details. <br><br>Be aware that these numbers are just estimations that also rely on the placement of the Pods in your deployment.",
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
      text: "To download the cluster picture click here. You can then use this picture in your report or slide",
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
