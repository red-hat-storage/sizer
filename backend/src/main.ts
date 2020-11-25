import * as classes from "./classes"

let platform = "metal";

let targetCapacity = 501;

const updatePlanning = function () {
	const resultScreen = $("#resultScreen")[0];
	const advancedResultScreen = $("#advancedResultScreen")[0];
	const SKUScreen = $("#SKUScreen")[0];
	const capacityRangeSlider = (<HTMLInputElement>$("#capacityRange")[0]);
	targetCapacity = +capacityRangeSlider.value;
	const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
	const disk = new classes.Disk(+diskSizeRangeSlider.value)
	const cluster = new classes.Cluster(platform, disk, targetCapacity);
	resultScreen.innerHTML = cluster.print();
	advancedResultScreen.innerHTML = cluster.printAdvanced("  ");
	SKUScreen.innerHTML = cluster.printSKU("  ");
	cluster.draw();
};

function setUpRange(range: HTMLInputElement, valueLabel: HTMLElement):void {
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
		return updatePlanning();
	});

	const capacityRangeSlider = (<HTMLInputElement>$("#capacityRange")[0]);
	const capacityRangeValue = $("#capacityRangeValue")[0];
	setUpRange(capacityRangeSlider, capacityRangeValue);

	const diskSizeRangeSlider = (<HTMLInputElement>$("#diskSizeRange")[0]);
	const diskSizeRangeValue = $("#diskSizeRangeValue")[0];
	setUpRange(diskSizeRangeSlider, diskSizeRangeValue);
});
