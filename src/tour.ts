import Shepherd from "shepherd.js";
import Cookies from "js-cookie";
export { Cookies };

export const tour = new Shepherd.Tour({
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
});

tour.addSteps([
  {
    title: "Welcome to the OCS Sizer",
    text: "This tool supports OCS 4.5 onwards",
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
      element: "#platformGroup",
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
      "Some platforms allow you to specify the CPU and Memory characteristics of your nodes. Select your node's CPU units here. Be aware that core count and CPU unit count can differ.",
    attachTo: {
      element: "#nodeCPU",
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
      element: "#nodeMemory",
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
      element: "#diskSizeGroup",
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
      "At last, chose how much usable capacity you need. This will be the total usable cluster capacity in the OCS cluster",
    attachTo: {
      element: "#clusterSizeGroup",
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
      "When your configuration is out of the regular support limits, we will show a banner here",
    attachTo: {
      element: "#supportExceptionWarning",
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
      show: function () {
        const banner = $("#supportExceptionWarning")[0];
        banner.classList.remove("d-none");
      },
      hide: function () {
        // This will trigger an update that checks if the banner should be visible
        $("#platform").trigger("change");
      },
    },
  },
  {
    text:
      "Generic information on how we calculate the cluster will be visible here and auto-update when you change the input",
    attachTo: {
      element: "#resultScreen",
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
      "A more advanced output that includes a view into how we distributed the OCS base service Pods can be toggled with this button.",
    attachTo: {
      element: "#advancedResultsButton",
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
      "To learn important information on how many SKUs you need for this cluster, toggle the information here",
    attachTo: {
      element: "#SKUResultsButton",
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
      "Finally down here you see your cluster as a picture with information on how much resources OCS will consume on each instance. Note that there is a difference between what OCS consumes (lower part) and the instance size (left part).",
    attachTo: {
      element: "#canvas",
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
      element: "#canvasDownloadBtn",
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
