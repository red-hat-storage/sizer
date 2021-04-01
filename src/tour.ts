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
    title: "Welcome to the ODF Sizer",
    text: "This tool supports ODF 4.7 onwards",
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
    when: {
      show: function () {
        const CPUselector = $(".manualNode")[0];
        CPUselector.classList.remove("d-none");
      },
      hide: function () {
        // This will trigger an update that checks if the CPUselector should be visible
        $("#platform").trigger("change");
      },
    },
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
    when: {
      show: function () {
        const memorySelector = $(".manualNode")[1];
        memorySelector.classList.remove("d-none");
      },
      hide: function () {
        // This will trigger an update that checks if the memorySelector should be visible
        $("#platform").trigger("change");
      },
    },
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
      "At last, chose how much usable capacity you need. This will be the total usable cluster capacity in the ODF cluster",
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
      "A more advanced output that includes a view into how we distributed the ODF base service Pods can be toggled with this button.",
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
  // {
  //   text:
  //     "You can tune your ODF deployment with this button. This will also allow you to chose an advanced deployment mode.",
  //   attachTo: {
  //     element: "#TuningButton",
  //     on: "top",
  //   },
  //   buttons: [
  //     {
  //       text: "Skip Tour",
  //       action: tour.cancel,
  //     },
  //     {
  //       text: "Next",
  //       action: tour.next,
  //     },
  //   ],
  // },
  {
    text:
      "Finally down here you see your cluster as a picture that you can share. Each column represents a distinct availability zone.",
    attachTo: {
      element: "#canvas-container",
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
      element: ".nodeSize",
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
      element: ".nodeDiskAmount",
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
      element: ".nodeUsedResources",
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
