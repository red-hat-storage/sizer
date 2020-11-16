class Cluster {
	servers: Array<Server>;
	platform: string;
	diskType: NVMe;
	static replicaCount = 3;

	constructor(platform: string, diskType: NVMe, targetCapacity: number) {
		this.platform = platform;
		this.diskType = diskType;
		this.servers = [];
		for (let i = 0; i < 3; i++) {
			this.addServer()
		}
		this.servers[0].addService(new Ceph_MGR)
		this.servers[0].addService(new Ceph_MON)
		this.servers[1].addService(new Ceph_MON)
		this.servers[2].addService(new Ceph_MON)
		this.servers[1].addService(new Ceph_RGW)
		this.servers[2].addService(new Ceph_RGW)
		this.servers[1].addService(new Ceph_MDS)
		this.servers[2].addService(new Ceph_MDS)
		this.servers[0].addService(new Noobaa_DB)
		this.servers[1].addService(new Noobaa_Endpoint)
		this.servers[2].addService(new Noobaa_core)

		const osdsNeededForTargetCapacity = Math.ceil(targetCapacity/diskType.maxCapacity()) * Cluster.replicaCount

		for (let i = 0; i < osdsNeededForTargetCapacity; i++) {
			this.addService(new Ceph_OSD)
		}
	}

	addServer() {
		switch (this.platform) {
			case "metal": return this.servers.push(new BareMetal(this.diskType));
			case "awsAttached": return this.servers.push(new AWSattached(this.diskType));
			case "awsEBS": return this.servers.push(new AWSEBS(this.diskType));
			case "vmware": return this.servers.push(new VMware(this.diskType));
		}
	}

	addService(service: Service) {
		// Find server with lowest CPU usage
		let targetServer = this.servers[0]
		this.servers.forEach(server => {
			if (server.getUsedCPU() < targetServer.getUsedCPU()) {
				targetServer = server
			}
		})
		if (!targetServer.addService(service)) {
			// If the server refuses to add the service
			// it is probably already full - then add a new server
			this.addServer()
			this.addService(service)
		}
	}
	print(indentation = "") {
		let message = `Each server has ${Object.getPrototypeOf(this.servers[0]).constructor.cpuCores} CPU cores, ${Object.getPrototypeOf(this.servers[0]).constructor.memory} GB memory and a maximum of ${Object.getPrototypeOf(this.servers[0]).constructor.maxDisks} disks.\n`;
		message += `The max disk size in this cluster is ${this.diskType.maxCapacity()}\n`;
		message += `This cluster has ${this.servers.length} servers`;
		for (let i = 0; i < this.servers.length; i++) {
			message += `\n\nSERVER ${i+1}\n` + this.servers[i].print(indentation);
		}
		return message
	}
}

abstract class Server {
	static maxDisks: number;
	static cpuCores: number;
	static memory: number;
	diskType: NVMe;
	services: Array<Service>;

	constructor(diskType: NVMe) {
		this.diskType = diskType;
		this.services = [];
	}

	maxCapacity() {
		return this.diskType.maxCapacity() * Server.maxDisks;
	}

	getUsedMemory() {
		let totalMemory = 0;
		this.services.forEach(service => {
			totalMemory += Object.getPrototypeOf(service).constructor.requiredMemory;
		});
		return totalMemory;
	}
	getUsedCPU() {
		let totalCores = 0;
		this.services.forEach(service => {
			totalCores += Object.getPrototypeOf(service).constructor.requiredCPU;
		});
		return totalCores;
	}
	addService(service: Service) {
		if (this.getUsedCPU() + Object.getPrototypeOf(service).constructor.requiredCPU > Object.getPrototypeOf(this).constructor.cpuCores ||
			this.getUsedMemory() + Object.getPrototypeOf(service).constructor.requiredMemory > Object.getPrototypeOf(this).constructor.memory) {
			return false
		}
		this.services.push(service)
		return true
	}
	getAmountOfOSDs() {
		let osdCount = 0;
		this.services.forEach(service => {
			if (service instanceof Ceph_OSD) {
				osdCount++
			}
		});
		return osdCount
	}
	serverHasService(service: Service) {
		this.services.forEach(serverService => {
			if (serverService instanceof Object.getPrototypeOf(service)) {
				return true
			}
		});
		return false
	}

	getInfo() {
		return `
Maximum number of disks per server: ${Server.maxDisks}
Maximum capacity of one server: ${this.maxCapacity()} TB
Disk vendor: ${this.diskType.vendor}
Server disk choices ${NVMe.capacities.join(" TB, ")} TB
Biggest available disk is ${this.diskType.maxCapacity()} TB
`;
	}

	print(indentation = "") {
		let message = indentation + `This server has ${this.getUsedCPU()} used CPU cores, ${this.getUsedMemory()} used GB of memory and ${this.getAmountOfOSDs()} disks\n`
		message += indentation + "SERVICES ON THIS SERVER:"
		this.services.forEach(service => {
			message += "\n" + service.print(indentation + indentation)
		});
		return message
	}
}

class BareMetal extends Server {
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

class VMware extends Server {
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

class AWSattached extends Server {
	// instance storage i3en.2xl
	// 2 x 2.5TB disks
	static maxDisks = 2;
	static cpuCores = 8;
	static memory = 64;
}

class AWSEBS extends Server {
	// instance with EBS m5.4xl
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

abstract class NVMe {
	vendor: string;
	static capacities: Array<number>;
	constructor(vendor: string) {
		this.vendor = vendor;
	}

	maxCapacity() {
		return Math.max(...Array.from(NVMe.capacities || []));
	}
}

class OneDWPD extends NVMe {
	constructor(vendor: string) {
		super(vendor);
		NVMe.capacities = (() => {
			switch (this.vendor) {
				case "intel": return [1.92, 3.84, 7.68];
				case "micron": return [3.84, 7.68, 15.36];
				default: return [1.92, 3.84, 7.68, 16.36];
			}
		})();
	}
}

class ThreeDWPD extends NVMe {
	static capacities = [1.6, 3.2, 6.4, 12.8];
}

abstract class Service {
	static requiredMemory: number;
	static requiredCPU: number;

	abstract print(indentation: string): string;
}

class Noobaa_core extends Service {
	static requiredMemory = 4;
	static requiredCPU = 1;

	print(indentation = "") {
		return indentation + "Noobaa Core"
	}
}

class Noobaa_DB extends Service {
	static requiredMemory = 4;
	static requiredCPU = 0.5;

	print(indentation = "") {
		return indentation + "Noobaa DB"
	}
}

class Noobaa_Endpoint extends Service {
	static requiredMemory = 2;
	static requiredCPU = 1;

	print(indentation = "") {
		return indentation + "Noobaa Endpoint"
	}
}

class Ceph_MDS extends Service {
	static requiredMemory = 8;
	static requiredCPU = 3;

	print(indentation = "") {
		return indentation + "Ceph MDS"
	}
}

class Ceph_MGR extends Service {
	static requiredMemory = 3;
	static requiredCPU = 1;

	print(indentation = "") {
		return indentation + "Ceph MGR"
	}
}

class Ceph_MON extends Service {
	static requiredMemory = 2;
	static requiredCPU = 1;

	print(indentation = "") {
		return indentation + "Ceph MON"
	}
}

class Ceph_OSD extends Service {
	static requiredMemory = 5;
	static requiredCPU = 2;

	print(indentation = "") {
		return indentation + "Ceph OSD"
	}
}

class Ceph_RGW extends Service {
	static requiredMemory = 4;
	static requiredCPU = 2;

	print(indentation = "") {
		return indentation + "Ceph RGW"
	}
}


let disk1vendor = "intel";
let platform = "metal";
let disk1 = new OneDWPD(disk1vendor);

let targetCapacity = 501;

const updatePlanning = function () {
	const resultScreen = $("#resultScreen")[0];
	const cluster = new Cluster(platform, disk1, targetCapacity);
	return resultScreen.innerHTML = cluster.print("  ");
};

const redoDisk = function (diskType: string) {
	switch (diskType) {
		case "1DPWD": disk1 = new OneDWPD(disk1vendor); break;
		case "3DPWD": disk1 = new ThreeDWPD(disk1vendor); break;
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
