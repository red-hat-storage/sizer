import * as classes from "./classes"

let platform = "metal";
let cluster: classes.Cluster

let targetCapacity = 501;

const updatePlanning = function () {
	const resultScreen = $("#resultScreen")[0];
	const advancedResultScreen = $("#advancedResultScreen")[0];
	const SKUScreen = $("#SKUScreen")[0];
	const capacityRangeSlider = (<HTMLInputElement>$("#capacityRange")[0]);
	targetCapacity = +capacityRangeSlider.value;
	const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
	const disk = new classes.Disk(+diskSizeRangeSlider.value)
	cluster = new classes.Cluster(platform, disk, targetCapacity);
	resultScreen.innerHTML = cluster.print();
	advancedResultScreen.innerHTML = cluster.printAdvanced("  ");
	SKUScreen.innerHTML = cluster.printSKU("  ");
	cluster.draw();
};

function setUpRange(range: HTMLInputElement, valueLabel: HTMLElement): void {
	valueLabel.innerHTML = range.value + " TB"; // Display the default slider value
	updatePlanning();

	// Update the current slider value (each time you drag the slider handle)
	range.oninput = function () {
		valueLabel.innerHTML = (<HTMLInputElement>this).value + " TB";
		updatePlanning();
	};
}

$(function () {
	$('#platform').on('change', function () {
		platform = ((<HTMLInputElement>this).value);
		const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
		const diskSizeRangeValue = $("#diskSizeRangeValue")[0];
		if (platform == "awsAttached") {
			diskSizeRangeSlider.disabled = true
			diskSizeRangeSlider.value = "2.5"
			diskSizeRangeValue.innerHTML = "2.5 TB"
		} else {
			diskSizeRangeSlider.disabled = false
		}
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
		this.href = cluster.canvas.toDataURL({format: 'png'});
		this.download = 'canvas.png'
	}, false)
});
