import * as classes from "./classes";
import * as tour from "./tour";
import html2canvas from "html2canvas";

let platform = "metal";
let cluster: classes.Cluster;

let targetCapacity = 501;

function updatePlanning() {
  const supportExceptionBanner = $("#supportExceptionWarning")[0];
  const supportExceptionAccordion = $("#supportExceptionAccordion")[0];
  const resultScreen = $("#resultScreen")[0];
  const advancedResultScreen = $("#advancedResultScreen")[0];
  const SKUScreen = $("#SKUScreen")[0];
  const capacityRangeSlider = <HTMLInputElement>$("#capacityRange")[0];
  const diskSizeRangeSlider = <HTMLInputElement>$("#diskSizeRange")[0];
  const diskSizeRangeValue = $("#diskSizeRangeValue")[0];
  const manualNodeRangeViews = $(".manualNode");
  const platformSelector = <HTMLInputElement>$("#platform")[0];
  const nodeCPURangeSlider = <HTMLInputElement>$("#nodeCPU")[0];
  const nodeMemoryRangeSlider = <HTMLInputElement>$("#nodeMemory")[0];

  const banner = $("#compactSizeWarning")[0];
  banner.classList.add("d-none");

  diskSizeRangeSlider.disabled = false;
  for (let i = 0; i < manualNodeRangeViews.length; i++) {
    const node = manualNodeRangeViews[i];
    node.classList.add("d-none");
  }
  supportExceptionBanner.classList.add("d-none");
  supportExceptionAccordion.innerHTML = "";

  platform = platformSelector.value;
  switch (platform) {
    case "awsAttached":
      diskSizeRangeSlider.disabled = true;
      diskSizeRangeSlider.value = "2.5";
      diskSizeRangeValue.innerHTML = "2.5 TB";
      break;
    case "metal":
    case "vm":
    case "vmPreview":
      // Make controls visible
      for (let i = 0; i < manualNodeRangeViews.length; i++) {
        const node = manualNodeRangeViews[i];
        node.classList.remove("d-none");
      }
      break;
    default:
      break;
  }

  const disk = new classes.Disk(+diskSizeRangeSlider.value);
  const deploymentType = (<HTMLInputElement>(
    $('input[name="deploymentType"]:checked')[0]
  )).value;

  // Evaluate if config needs a support exception
  if (+diskSizeRangeSlider.value > 4) {
    const message = `Currently we only test disk sizes up to 4TB. While we do not expect any issues with larger disks, we do not currently test this and thus you will need to request a support exception.`;
    addSupportExceptionReason("DiskSize", "Disk exceeds 4TB", message);
  }
  if (["vmPreview", "azure", "gcp", "awsAttached"].includes(platform)) {
    const message = `You selected a platform that is currently in tech-preview. While we are confident with the results of our testing so far, not all disaster scenarios have been tested and you will need to request a support exception to run on this platform in production.<br>
    We also use these support exceptions to learn about the demand for the various platforms and to priorities which platform will be fully supported next.`;
    addSupportExceptionReason("Platform", "Platform in Tech Preview", message);
  }
  if (
    deploymentType == "compact" ||
    deploymentType == "minimal" ||
    deploymentType == "serviceDisable"
  ) {
    const message = `The deployment mode you selected is currently only available as Technology Preview. This means you need a support exception to be able to get support with this mode. <br>Chose the standard deployment mode to get the most stability and be able to scale out further.`;
    addSupportExceptionReason(
      "DeploymentMode",
      "Deployment Mode in Tech Preview",
      message
    );
  }
  targetCapacity = +capacityRangeSlider.value;
  const cephFSActive = (<HTMLInputElement>$("#cephFSActive")[0]).checked;
  const nooBaaActive = (<HTMLInputElement>$("#nooBaaActive")[0]).checked;
  const rgwActive = (<HTMLInputElement>$("#rgwActive")[0]).checked;
  const nvmeTuning = (<HTMLInputElement>$("#nvmeTuning")[0]).checked;

  cluster = new classes.Cluster(
    platform,
    deploymentType,
    disk,
    targetCapacity,
    +nodeCPURangeSlider.value,
    +nodeMemoryRangeSlider.value,
    cephFSActive,
    nooBaaActive,
    rgwActive,
    nvmeTuning
  );
  resultScreen.innerHTML = cluster.print();
  advancedResultScreen.innerHTML = cluster.printAdvanced("  ");
  SKUScreen.innerHTML = cluster.printSKU();

  const cpuUnitTooltip = $(".cpuUnitTooltip");
  for (let i = 0; i < cpuUnitTooltip.length; i++) {
    const tooltip = cpuUnitTooltip[i];
    tooltip.setAttribute(
      "title",
      "CPU Units are the number of threads you see on the host - you get this number with nproc<br>Your CPU specification will list the CPU threads and cores. Threads are the number of CPU units, cores will be used for the SKU calculation.<br>Click <a href='https://www.guru99.com/cpu-core-multicore-thread.html' target='_blank'>here</a> to learn about the thread vs core difference."
    );
    tooltip.setAttribute("data-toggle", "tooltip");
    tooltip.setAttribute("data-placement", "top");
    tooltip.setAttribute("data-html", "true");
    tooltip.setAttribute("type", "button");
  }
  // enable tooltips
  (<any>$('[data-toggle="tooltip"]')).tooltip(); // eslint-disable-line @typescript-eslint/no-explicit-any

  window.history.replaceState(
    {},
    "",
    `?platform=${platform}&diskSize=${diskSizeRangeSlider.value}&totalCapacity=${capacityRangeSlider.value}&nodeCPU=${nodeCPURangeSlider.value}&nodeMemory=${nodeMemoryRangeSlider.value}&deploymentType=${deploymentType}&cephFSActive=${cephFSActive}&nooBaaActive=${nooBaaActive}&rgwActive=${rgwActive}&nvmeTuning=${nvmeTuning}`
  );

  cluster.draw();
}

// comapctWarn is called by the cluster if more than three nodes are required, but we are running with compact mode
export function compactWarn(): void {
  const banner = $("#compactSizeWarning")[0];
  banner.classList.remove("d-none");
}

function setUpRange(range: HTMLInputElement, valueLabel: HTMLElement): void {
  valueLabel.innerHTML = range.value + " TB"; // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  range.oninput = function () {
    valueLabel.innerHTML = (<HTMLInputElement>this).value + " TB";
    updatePlanning();
  };
}

function setInputs(
  platformLocal: string,
  diskSize: string,
  totalCapacity: string,
  nodeCPU: string,
  nodeMemory: string,
  deploymentType: string,
  cephFSActive: string,
  nooBaaActive: string,
  rgwActive: string,
  nvmeTuning: string
) {
  platform = platformLocal;
  targetCapacity = +totalCapacity;
  (<HTMLInputElement>$("#platform")[0]).value = platformLocal;
  (<HTMLInputElement>$("#diskSizeRange")[0]).value = diskSize;
  (<HTMLInputElement>$("#capacityRange")[0]).value = totalCapacity;
  (<HTMLInputElement>$("#nodeCPU")[0]).value = nodeCPU;
  (<HTMLInputElement>$("#nodeMemory")[0]).value = nodeMemory;
  (<HTMLInputElement>$("#cephFSActive")[0]).checked = JSON.parse(cephFSActive);
  (<HTMLInputElement>$("#nooBaaActive")[0]).checked = JSON.parse(nooBaaActive);
  (<HTMLInputElement>$("#rgwActive")[0]).checked = JSON.parse(rgwActive);
  (<HTMLInputElement>$("#nvmeTuning")[0]).checked = JSON.parse(nvmeTuning);

  console.log(`Type: ${deploymentType}`);
  const checkboxes = $("input[name=deploymentType]");
  for (let index = 0; index < checkboxes.length; index++) {
    const checkbox = <HTMLInputElement>checkboxes[index];
    checkbox.checked = false;
    if (checkbox.parentElement != null) {
      checkbox.parentElement.classList.remove("active");
      checkbox.parentElement.classList.remove("focus");
    }
  }
  // Click implies updatePlanning()
  $(`#${deploymentType}Mode`)[0].click();
}

$(function () {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (<any>$(".notServiceDisable")).on("click", function () {
    (<any>$("#TuningServiceDisable")).collapse("hide");
    (<any>$(".serviceDisableCheckBox")).prop("checked", true);
    updatePlanning();
  });
  (<any>$(".serviceDisable")).on("click", function () {
    (<any>$("#TuningServiceDisable")).collapse("show");
    updatePlanning();
  });
  (<any>$(".serviceDisableCheckBox")).on("click change", function () {
    updatePlanning();
  });
  (<any>$("#nvmeTuning")).on("click change", function () {
    updatePlanning();
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const searchString = window.location.search.split("?");
  if (searchString.length > 1 && searchString[1].split("&").length >= 5) {
    let platform = "metal",
      diskSize = "4",
      totalCapacity = "10",
      nodeCPU = "32",
      nodeMemory = "64",
      deploymentType = "standard",
      cephFSActive = "true",
      nooBaaActive = "true",
      rgwActive = "true",
      nvmeTuning = "false";
    searchString[1].split("&").forEach((searchString) => {
      switch (searchString.split("=")[0]) {
        case "platform":
          platform = searchString.split("=")[1];
          break;
        case "diskSize":
          diskSize = searchString.split("=")[1];
          break;
        case "totalCapacity":
          totalCapacity = searchString.split("=")[1];
          break;
        case "nodeCPU":
          nodeCPU = searchString.split("=")[1];
          break;
        case "nodeMemory":
          nodeMemory = searchString.split("=")[1];
          break;
        case "deploymentType":
          deploymentType = searchString.split("=")[1];
          break;
        case "cephFSActive":
          cephFSActive = searchString.split("=")[1];
          break;
        case "nooBaaActive":
          nooBaaActive = searchString.split("=")[1];
          break;
        case "rgwActive":
          rgwActive = searchString.split("=")[1];
          break;
        case "nvmeTuning":
          nvmeTuning = searchString.split("=")[1];
          break;
      }
    });
    setInputs(
      platform,
      diskSize,
      totalCapacity,
      nodeCPU,
      nodeMemory,
      deploymentType,
      cephFSActive,
      nooBaaActive,
      rgwActive,
      nvmeTuning
    );
  } else {
    $("#standardMode")[0].click();
  }

  $("#nodeCPU").on("change", function () {
    updatePlanning();
  });

  $("#nodeMemory").on("change", function () {
    updatePlanning();
  });

  const testThing = $("#platform");
  testThing.on("change", function () {
    platform = (<HTMLInputElement>this).value;
    const nodeCPURangeSlider = <HTMLInputElement>$("#nodeCPU")[0];
    const nodeMemoryRangeSlider = <HTMLInputElement>$("#nodeMemory")[0];
    switch (platform) {
      case "metal":
        nodeCPURangeSlider.value = "32";
        nodeMemoryRangeSlider.value = "64";
        break;
      case "vm":
      case "vmPreview":
        nodeCPURangeSlider.value = "48";
        nodeMemoryRangeSlider.value = "128";
        break;
    }
    updatePlanning();
  });

  const capacityRangeSlider = <HTMLInputElement>$("#capacityRange")[0];
  const capacityRangeValue = $("#capacityRangeValue")[0];
  setUpRange(capacityRangeSlider, capacityRangeValue);

  const diskSizeRangeSlider = <HTMLInputElement>$("#diskSizeRange")[0];
  const diskSizeRangeValue = $("#diskSizeRangeValue")[0];
  setUpRange(diskSizeRangeSlider, diskSizeRangeValue);

  const canvasDownloadBtn = <HTMLAnchorElement>$("#canvasDownloadBtn")[0];
  canvasDownloadBtn.addEventListener(
    "click",
    function () {
      const link = document.createElement("a");
      link.download = "ODF-Sizer.png";
      html2canvas($("#canvas-container")[0]).then((canvas) => {
        canvas.id = "download-canvas";
        canvas.classList.add("d-none");
        // document.body.appendChild(canvas);
        console.log("export image");
        link.href = canvas.toDataURL();
        link.click();
      });
    },
    false
  );

  if (!tour.Cookies.get("SkipTour")) {
    console.debug("skipTour cookie not found, doing Tour");
    tour.tour.start();
  }
  updatePlanning();
});

function addSupportExceptionReason(
  id: string,
  title: string,
  message: string
): void {
  id = `SupportException${id}`;
  const supportExceptionBanner = $("#supportExceptionWarning")[0];
  supportExceptionBanner.classList.remove("d-none");

  const target = <HTMLDivElement>$("#supportExceptionAccordion")[0];
  const row = document.createElement("div");
  row.classList.add("row", "px-4");

  const column = document.createElement("div");
  column.classList.add("col");
  row.appendChild(column);

  const card = document.createElement("div");
  card.classList.add("card");
  column.appendChild(card);

  const cardHeader = document.createElement("div");
  cardHeader.classList.add("card-header", "p-0");
  cardHeader.id = `${id}Heading`;
  cardHeader.innerHTML = `
  <h5 class="mb-0">
  <button
  class="btn btn-link collapsed"
  data-toggle="collapse"
  data-target="#${id}"
  aria-expanded="false"
  aria-controls="${id}"
  >
  ${title}
  </button>
  </h5>
  `;
  card.appendChild(cardHeader);

  const cardBody = document.createElement("div");
  cardBody.classList.add("collapse");
  cardBody.id = id;
  cardBody.setAttribute("aria-labelledby", `${id}Heading`);
  cardBody.innerHTML = `
  <div class="card-body text-dark">
  ${message}
  </div>
  `;
  card.appendChild(cardBody);

  target.appendChild(row);
}
