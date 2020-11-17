declare module "jquery" {
    export = $;
}
class Cluster {
	replicaSets: Array<ReplicaSet>;
	platform: string;
	diskType: NVMe;
	static replicaCount = 3;

	constructor(platform: string, diskType: NVMe, targetCapacity: number) {
		this.platform = platform;
		this.diskType = diskType;
		this.replicaSets = [new ReplicaSet(this.platform, this.diskType)];
		// this.addReplicaSet();
		this.addService(new Ceph_MGR)
		this.addService(new Ceph_MON)
		this.addService(new Ceph_RGW)
		this.addService(new Ceph_MDS)
		this.addService(new Noobaa_DB)
		this.addService(new Noobaa_Endpoint)
		this.addService(new Noobaa_core)

		const osdsNeededForTargetCapacity = Math.ceil(targetCapacity / diskType.maxCapacity())

		for (let i = 0; i < osdsNeededForTargetCapacity; i++) {
			this.addService(new Ceph_OSD)
		}
	}

	addReplicaSet() {
		const count = this.replicaSets.push(new ReplicaSet(this.platform, this.diskType))
		console.log(`Added new Set - now we have ${count}`)
	}

	addService(service: Service) {
		// Use the replicaSet that was added last
		// We assume that we fill up replicaSets before we add new ones
		const targetSet = this.replicaSets[this.replicaSets.length - 1]
		if (!targetSet.addService(service)) {
			// If the set refuses to add the service
			// it is probably already full - then add a new set
			console.log("ADDING SET")
			this.addReplicaSet()
			this.addService(service)
		}
	}
	print(indentation = "") {
		let message = `Each server has ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.cpuCores} CPU cores, ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.memory} GB memory and a maximum of ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.maxDisks} disks.\n`;
		message += `The max disk size in this cluster is ${this.diskType.maxCapacity()}\n`;
		message += `This cluster has ${this.replicaSets.length * Cluster.replicaCount} servers`;
		for (let i = 0; i < this.replicaSets.length; i++) {
			message += `\n\nReplicaSet ${i + 1}` + this.replicaSets[i].print(indentation);
		}
		return message
	}
}

class ReplicaSet {
	replicaCount: number
	platform: string
	diskType: NVMe;
	servers: Array<Server>

	constructor(platform: string, diskType: NVMe) {
		this.replicaCount = 3
		this.platform = platform
		this.diskType = diskType
		this.servers = []
		for (let i = 0; i < this.replicaCount; i++) {
			switch (this.platform) {
				case "metal": this.servers.push(new BareMetal(this.diskType)); break;
				case "awsAttached": this.servers.push(new AWSattached(this.diskType)); break;
				case "awsEBS": this.servers.push(new AWSEBS(this.diskType)); break;
				case "vmware": this.servers.push(new VMware(this.diskType)); break;
			}
		}
	}

	addService(service: Service) {
		let returnFlag = true
		switch (Object.getPrototypeOf(service).constructor) {
			// Services running on 3 servers
			case Ceph_MON:
			case Ceph_OSD:
				this.servers.forEach(server => {
					if (!server.canIAddService(service)) {
						returnFlag = false
						return
					}
				});
				if (!returnFlag) return false
				this.servers.forEach(server => {
					server.addService(service)
				});
				return true
			// Services running on 2 servers
			case Ceph_MDS:
			case Ceph_MGR:
			case Ceph_RGW:
			case Noobaa_DB:
			case Noobaa_Endpoint:
			case Noobaa_core:
				// Sort servers ascending based on used CPU
				this.servers.sort(function (a, b) {
					if (a.getUsedCPU() < b.getUsedCPU()) return -1
					else return 1
				});
				this.servers.slice(0,1).forEach(server => {
					if (!server.canIAddService(service)) return false
				});
				this.servers.slice(0,1).forEach(server => {
					server.addService(service)
				});
				return true
		}
	}

	print(indentation = "") {
		let message = ""
		for (let i = 0; i < this.servers.length; i++) {
			message += `\n${indentation}SERVER ${i + 1}\n` + this.servers[i].print(indentation + indentation);
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
	canIAddService(service: Service) {
		if (this.getUsedCPU() + Object.getPrototypeOf(service).constructor.requiredCPU > Object.getPrototypeOf(this).constructor.cpuCores ||
			this.getUsedMemory() + Object.getPrototypeOf(service).constructor.requiredMemory > Object.getPrototypeOf(this).constructor.memory) {
			return false
		}
		if (service instanceof Ceph_OSD && this.getAmountOfOSDs() >= Object.getPrototypeOf(this).constructor.maxDisks) {
			return false
		}
		return true
	}
	addService(service: Service) {
		if (this.canIAddService(service)) {
			this.services.push(service)
			return true
		}
		return false
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
		return NVMe.capacities.reduce(function(a,b){
			return Math.max(a,b);
		})
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
