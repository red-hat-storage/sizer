import * as draw from "./draw"

export class Cluster {
	replicaSets: Array<ReplicaSet>;
	platform: string;
	diskType: NVMe;
	canvas;
	static replicaCount = 3;

	constructor(platform: string, diskType: NVMe, targetCapacity: number) {
		this.platform = platform;
		this.diskType = diskType;
		this.canvas = draw.getCanvas();
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

	addReplicaSet(): void {
		this.replicaSets.push(new ReplicaSet(this.platform, this.diskType))
	}

	addService(service: Service): void {
		// Use the replicaSet that was added last
		// We assume that we fill up replicaSets before we add new ones
		const targetSet = this.replicaSets[this.replicaSets.length - 1]
		if (!targetSet.addService(service)) {
			// If the set refuses to add the service
			// it is probably already full - then add a new set
			this.addReplicaSet()
			this.addService(service)
		}
	}
	print(): string {
		let message = `Each server has ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.cpuCores} CPU cores, ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.memory} GB memory and a maximum of ${Object.getPrototypeOf(this.replicaSets[0].servers[0]).constructor.maxDisks} disks.\n`;
		message += `The max disk size in this cluster is ${this.diskType.maxCapacity()}\n`;
		message += `This cluster has ${this.replicaSets.length * Cluster.replicaCount} servers`;
		return message
	}

	printAdvanced(indentation = ""): string {
		let message = "";
		for (let i = 0; i < this.replicaSets.length; i++) {
			message += `\n\nNodeSet ${i + 1}` + this.replicaSets[i].print(indentation);
		}
		return message
	}

	draw(): void {
		let topPad = 0
		this.replicaSets.forEach(replicaSet => {
			replicaSet.draw(this.canvas, topPad)
			topPad += 300
		})
	}
}

export class ReplicaSet {
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

	addService(service: Service): boolean {
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
				this.servers.slice(0, 1).forEach(server => {
					if (!server.canIAddService(service)) return false
				});
				this.servers.slice(0, 1).forEach(server => {
					server.addService(service)
				});
				return true
		}
		return false
	}

	print(indentation = ""): string {
		let message = ""
		for (let i = 0; i < this.servers.length; i++) {
			message += `\n${indentation}SERVER ${i + 1}\n` + this.servers[i].print(indentation + indentation);
		}
		return message
	}

	draw(canvas: fabric.Canvas, topPad: number): void {
		let leftPad = 0
		this.servers.forEach(server => {
			draw.drawServer(canvas, server, leftPad, topPad)
			leftPad += 300
		})
	}
}

export abstract class Server {
	static maxDisks: number;
	static cpuCores: number;
	static memory: number;
	diskType: NVMe;
	services: Array<Service>;

	constructor(diskType: NVMe) {
		this.diskType = diskType;
		this.services = [];
	}

	maxCapacity(): number {
		return this.diskType.maxCapacity() * Server.maxDisks;
	}

	getUsedMemory(): number {
		let totalMemory = 0;
		this.services.forEach(service => {
			totalMemory += Object.getPrototypeOf(service).constructor.requiredMemory;
		});
		return totalMemory;
	}
	getUsedCPU(): number {
		let totalCores = 0;
		this.services.forEach(service => {
			totalCores += Object.getPrototypeOf(service).constructor.requiredCPU;
		});
		return totalCores;
	}
	canIAddService(service: Service): boolean {
		if (this.getUsedCPU() + Object.getPrototypeOf(service).constructor.requiredCPU > Object.getPrototypeOf(this).constructor.cpuCores ||
			this.getUsedMemory() + Object.getPrototypeOf(service).constructor.requiredMemory > Object.getPrototypeOf(this).constructor.memory) {
			return false
		}
		if (service instanceof Ceph_OSD && this.getAmountOfOSDs() >= Object.getPrototypeOf(this).constructor.maxDisks) {
			return false
		}
		return true
	}
	addService(service: Service): boolean {
		if (this.canIAddService(service)) {
			this.services.push(service)
			return true
		}
		return false
	}
	getAmountOfOSDs(): number {
		let osdCount = 0;
		this.services.forEach(service => {
			if (service instanceof Ceph_OSD) {
				osdCount++
			}
		});
		return osdCount
	}
	serverHasService(service: Service): boolean {
		this.services.forEach(serverService => {
			if (serverService instanceof Object.getPrototypeOf(service)) {
				return true
			}
		});
		return false
	}

	getInfo(): string {
		return `
Maximum number of disks per server: ${Server.maxDisks}
Maximum capacity of one server: ${this.maxCapacity()} TB
Disk vendor: ${this.diskType.vendor}
Server disk choices ${NVMe.capacities.join(" TB, ")} TB
Biggest available disk is ${this.diskType.maxCapacity()} TB
`;
	}

	print(indentation = ""): string {
		let message = indentation + `This server has ${this.getUsedCPU()} used CPU cores, ${this.getUsedMemory()} used GB of memory and ${this.getAmountOfOSDs()} disks\n`
		message += indentation + "SERVICES ON THIS SERVER:"
		this.services.forEach(service => {
			message += "\n" + service.print(indentation + indentation)
		});
		return message
	}
}

export class BareMetal extends Server {
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

export class VMware extends Server {
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

export class AWSattached extends Server {
	// instance storage i3en.2xl
	// 2 x 2.5TB disks
	static maxDisks = 2;
	static cpuCores = 8;
	static memory = 64;
}

export class AWSEBS extends Server {
	// instance with EBS m5.4xl
	static maxDisks = 8;
	static cpuCores = 16;
	static memory = 64;
}

export abstract class NVMe {
	vendor: string;
	static capacities: Array<number>;
	constructor(vendor: string) {
		this.vendor = vendor;
	}

	maxCapacity(): number {
		return NVMe.capacities.reduce(function (a, b) {
			return Math.max(a, b);
		})
	}
}

export class OneDWPD extends NVMe {
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

export class ThreeDWPD extends NVMe {
	constructor(vendor: string) {
		super(vendor);
		NVMe.capacities = [1.6, 3.2, 6.4, 12.8];
	}
}

export abstract class Service {
	static requiredMemory: number;
	static requiredCPU: number;

	abstract print(indentation: string): string;
}

export class Noobaa_core extends Service {
	static requiredMemory = 4;
	static requiredCPU = 1;

	print(indentation = ""): string {
		return indentation + "Noobaa Core"
	}
}

export class Noobaa_DB extends Service {
	static requiredMemory = 4;
	static requiredCPU = 0.5;

	print(indentation = ""): string {
		return indentation + "Noobaa DB"
	}
}

export class Noobaa_Endpoint extends Service {
	static requiredMemory = 2;
	static requiredCPU = 1;

	print(indentation = ""): string {
		return indentation + "Noobaa Endpoint"
	}
}

export class Ceph_MDS extends Service {
	static requiredMemory = 8;
	static requiredCPU = 3;

	print(indentation = ""): string {
		return indentation + "Ceph MDS"
	}
}

export class Ceph_MGR extends Service {
	static requiredMemory = 3;
	static requiredCPU = 1;

	print(indentation = ""): string {
		return indentation + "Ceph MGR"
	}
}

export class Ceph_MON extends Service {
	static requiredMemory = 2;
	static requiredCPU = 1;

	print(indentation = ""): string {
		return indentation + "Ceph MON"
	}
}

export class Ceph_OSD extends Service {
	static requiredMemory = 5;
	static requiredCPU = 2;

	print(indentation = ""): string {
		return indentation + "Ceph OSD"
	}
}

export class Ceph_RGW extends Service {
	static requiredMemory = 4;
	static requiredCPU = 2;

	print(indentation = ""): string {
		return indentation + "Ceph RGW"
	}
}
