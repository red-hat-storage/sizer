import * as classes from "./classes"

let platform = "metal";
let cluster: classes.Cluster

let targetCapacity = 501;

function updatePlanning() {
	const resultScreen = $("#resultScreen")[0];
	const advancedResultScreen = $("#advancedResultScreen")[0];
	const SKUScreen = $("#SKUScreen")[0];
	const capacityRangeSlider = (<HTMLInputElement>$("#capacityRange")[0]);
	const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
	const diskSizeRangeValue = $("#diskSizeRangeValue")[0];

	if (platform == "awsAttached") {
		diskSizeRangeSlider.disabled = true
		diskSizeRangeSlider.value = "2.5"
		diskSizeRangeValue.innerHTML = "2.5 TB"
	} else {
		diskSizeRangeSlider.disabled = false
	}

	const disk = new classes.Disk(+diskSizeRangeSlider.value)
	targetCapacity = +capacityRangeSlider.value;
	cluster = new classes.Cluster(platform, disk, targetCapacity);
	resultScreen.innerHTML = cluster.print();
	advancedResultScreen.innerHTML = cluster.printAdvanced("  ");
	SKUScreen.innerHTML = cluster.printSKU("  ");

	// enable tooltips
	(<any>$('[data-toggle="tooltip"]')).tooltip(); // eslint-disable-line @typescript-eslint/no-explicit-any

	window.history.replaceState({}, "", `?platform=${platform}&diskSize=${diskSizeRangeSlider.value}&totalCapacity=${capacityRangeSlider.value}`)

	cluster.draw();
}

function setUpRange(range: HTMLInputElement, valueLabel: HTMLElement): void {
	valueLabel.innerHTML = range.value + " TB"; // Display the default slider value
	updatePlanning();

	// Update the current slider value (each time you drag the slider handle)
	range.oninput = function () {
		valueLabel.innerHTML = (<HTMLInputElement>this).value + " TB";
		updatePlanning();
	};
}

function setInputs(platformLocal: string, diskSize: string, totalCapacity: string) {
	platform = platformLocal;
	targetCapacity = +totalCapacity;
	(<HTMLInputElement>$("#platform")[0]).value = platformLocal;
	(<HTMLInputElement>$("#diskSizeRange")[0]).value = diskSize;
	(<HTMLInputElement>$("#capacityRange")[0]).value = totalCapacity;
	updatePlanning()
}

$(function () {
	const searchString = window.location.search.split("?")
	if (searchString.length > 1 && searchString[1].split("&").length == 3) {
		let platform = "", diskSize = "", totalCapacity = ""
		searchString[1].split("&").forEach(searchString => {
			switch (searchString.split("=")[0]) {
				case "platform":
					platform = searchString.split("=")[1]
					break;
				case "diskSize":
					diskSize = searchString.split("=")[1]
					break;
				case "totalCapacity":
					totalCapacity = searchString.split("=")[1]
					break;
			}
		});
		setInputs(platform, diskSize, totalCapacity)
	}

	$('#platform').on('change', function () {
		platform = ((<HTMLInputElement>this).value);
		updatePlanning();
	});

	const capacityRangeSlider = (<HTMLInputElement>$("#capacityRange")[0]);
	const capacityRangeValue = $("#capacityRangeValue")[0];
	setUpRange(capacityRangeSlider, capacityRangeValue);

	const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
	const diskSizeRangeValue = $("#diskSizeRangeValue")[0];
	setUpRange(diskSizeRangeSlider, diskSizeRangeValue);

	const canvasDownloadBtn = (<HTMLAnchorElement>$("#canvasDownloadBtn")[0]);
	canvasDownloadBtn.addEventListener("click", function () {
		console.log('export image');
		this.href = cluster.canvas.toDataURL({ format: 'png' });
		this.download = 'canvas.png'
	}, false);

});
