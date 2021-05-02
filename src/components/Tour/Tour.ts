import Shepherd from "shepherd.js";
import * as Cookies from "js-cookie";
import { Action, Payload } from "../../types";

type GetSizeTour = (
  setTour: React.Dispatch<React.SetStateAction<boolean>>,
  setActiveTab: React.Dispatch<React.SetStateAction<number>>,
  dispatch: React.Dispatch<{ type: Action; payload: Payload }>
) => Shepherd.Tour;

export const getSizerTour: GetSizeTour = (setTour, setActiveTab, dispatch) => {
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
    setTour(false);
  });

  tour.on("cancel", () => {
    setTour(false);
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
      title: "Sharing",
      text:
        "You can share your configuration by copying the URL above. It will auto-update when you change anything.",
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
      text:
        "Chose your Platform here. Note that some Platforms are in tech-preview",
      attachTo: {
        element: "#dropdown-platform",
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
      when: {
        show: () => {
          setActiveTab(0);
        },
      },
    },
    {
      text:
        "Some platforms allow you to specify the CPU and Memory characteristics of your nodes. Select your node's CPU units here. Be aware that core count and CPU unit count can differ.",
      attachTo: {
        element: "#cpu-dropdown",
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
      text: "Select your node's amount of memory here",
      attachTo: {
        element: "#memory-dropdown",
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
      text:
        "Now select how large each disk is. We assume all disks will be of equal size.",
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
      text:
        "At last, chose how much usable capacity you need. This will be the total usable cluster capacity in the ODF cluster",
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
      text:
        "When your configuration is out of the regular support limits, we will show a modal here",
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
        show: () => {
          // Set State to make the cluster out of regular support size
          dispatch({ type: Action.setFlashSize, payload: 6 });
          setActiveTab(1);
        },
        hide: () => {
          // Revert it to original State
          dispatch({ type: Action.setFlashSize, payload: 2.5 });
        },
      },
    },
    {
      text:
        "Generic information on how we calculate the cluster will be visible here and auto-update when you change the input",
      attachTo: {
        element: "#results",
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
      text:
        "A more advanced output that includes a view into how we distributed the ODF base service Pods can be toggled with this button.",
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
      text:
        "Finally down here you see your cluster as a picture that you can share. Each column represents a distinct availability zone.",
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
      text:
        "Each node has the same size, which is displayed here. For public cloud deployments we display our instance type recommendation.",
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
      text:
        "Here we show how many disks will be used on this node. The amount of disks may vary between rows of nodes.",
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
      text:
        "These bars show you how much CPU and Memory is used up by this deployment. It will estimate what ODF will use up and for compact mode also estimate what OCP will use up at least. <br>If you hover over the bars, it will show more details. <br><br>Be aware that these numbers are just estimations that also rely on the placement of the Pods in your deployment.",
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
      text:
        "To download the cluster picture click here. You can then use this picture in your report or slide",
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
