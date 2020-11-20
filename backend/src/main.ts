import * as classes from "./classes"

let disk1vendor = "intel";
let platform = "metal";
let disk1 = new classes.OneDWPD(disk1vendor);

let targetCapacity = 501;

const updatePlanning = function () {
	const resultScreen = $("#resultScreen")[0];
	const advancedResultScreen = $("#advancedResultScreen")[0];
	const cluster = new classes.Cluster(platform, disk1, targetCapacity);
	resultScreen.innerHTML = cluster.print();
	advancedResultScreen.innerHTML = cluster.printAdvanced("  ");
	cluster.draw();
};

const redoDisk = function (diskType: string) {
	console.log(`Changing disk to ${diskType}`)
	switch (diskType) {
		case "1DPWD": disk1 = new classes.OneDWPD(disk1vendor); break;
		case "3DPWD": disk1 = new classes.ThreeDWPD(disk1vendor); break;
	}
	return platform = ((<HTMLInputElement>$('#platform')[0]).value);
};


$(function () {
	$('#platform').on('change', function () {
		platform = ((<HTMLInputElement>this).value);
		return updatePlanning();
	});

	$('#diskVendor').on('change', function () {
		disk1vendor = (<HTMLInputElement>this).value;
		redoDisk((<HTMLInputElement>$('#diskType')[0]).value);
		return updatePlanning();
	});

	$('#diskType').on('change', function () {
		redoDisk((<HTMLInputElement>this).value);
		return updatePlanning();
	});

	const slider = (<HTMLInputElement>$("#capacityRange")[0]);
	const output = $("#rangeValue")[0];
	output.innerHTML = slider.value + " TB"; // Display the default slider value
	targetCapacity = +slider.value;
	updatePlanning();

	// Update the current slider value (each time you drag the slider handle)
	return slider.oninput = function () {
		output.innerHTML = (<HTMLInputElement>this).value + " TB";
		targetCapacity = +(<HTMLInputElement>this).value;
		return updatePlanning();
	};
});
