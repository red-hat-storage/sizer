class Server {
  maxDisks: number;
  diskType: OneDWPD;
  cpuCores: number;
  memory: number;
  static initClass() {
    this.prototype.maxDisks = 0;
  }
  constructor(diskType: OneDWPD) {
    this.diskType = diskType;
  }

  maxCapacity() {
    return this.diskType.maxCapacity() * this.maxDisks;
  }

  getInfo() {
    return `\
Maximum number of disks per server: ${this.maxDisks}
Maximum capacity of one server: ${this.maxCapacity()} TB
Disk vendor: ${this.diskType.vendor}
Server disk choices ${this.diskType.capacities.join(" TB, ")} TB
Biggest available disk is ${this.diskType.maxCapacity()} TB\
`;
  }
}
Server.initClass();

class BareMetal extends Server {
  static initClass() {
    this.prototype.maxDisks = 8;
  }
}
BareMetal.initClass();

class VMware extends Server {
  static initClass() {
    this.prototype.maxDisks = 8;
  }
}
VMware.initClass();

class AWSattached extends Server {
  static initClass() {
    // instance storage i3en.2xl
    this.prototype.maxDisks = 2;
  }
}
AWSattached.initClass();

class AWSEBS extends Server {
  static initClass() {
    // instance with EBS m5.4xl
    this.prototype.maxDisks = 8;
    this.prototype.cpuCores = 16;
  }
}
AWSEBS.initClass();

class NVMe {
  capacities: Array<number>;
  vendor: string;
  static initClass() {
    this.prototype.capacities = [];
  }
  constructor(vendor: string) {
    this.vendor = vendor;
  }

  maxCapacity() {
    return Math.max(...Array.from(this.capacities || []));
  }
}
NVMe.initClass();

class OneDWPD extends NVMe {
  constructor(vendor: string) {
    super(vendor);
    this.capacities = (() => {
      switch (this.vendor) {
        case "intel": return [1.92, 3.84, 7.68];
        case "micron": return [3.84, 7.68, 15.36];
        default: return [1.92, 3.84, 7.68, 16.36];
      }
    })();
  }
}

class ThreeDWPD extends NVMe {
  static initClass() {
    this.prototype.capacities = [1.6, 3.2, 6.4, 12.8];
  }
}
ThreeDWPD.initClass();


let disk1vendor = "intel";
let disk1 = new OneDWPD(disk1vendor);
let server1 = new BareMetal(disk1);

let targetCapacity = 501;
const numberOfReplicaGroups = (targetCapacity: number, serverType: { maxCapacity: () => number; }) => Math.ceil(targetCapacity / serverType.maxCapacity());


const remainderStorageCluster = function (targetCapacity: number, serverType: { maxCapacity: () => number; }) {
  const fullSets = Math.floor(targetCapacity / serverType.maxCapacity());
  return targetCapacity - (fullSets * serverType.maxCapacity());
};

const remainderStorageServer = (targetCapacity: number, diskType: { maxCapacity: () => number; }) => Math.ceil(targetCapacity / diskType.maxCapacity());

const capacityPlanning = function (targetCapacity: number, serverType: BareMetal) {
  const remainderStorageNeeded = remainderStorageCluster(targetCapacity, serverType);
  return `\
Necessary replica groups to reach target capacity of ${targetCapacity} TB: ${numberOfReplicaGroups(targetCapacity, serverType)}
Storage to be distributed in last storage group is approximately ${Math.round((remainderStorageNeeded + Number.EPSILON) * 100) / 100} TB
Number of disks in last storage group's servers is ${remainderStorageServer(remainderStorageNeeded, server1.diskType)}\
`;
};

const updatePlanning = function () {
  const resultScreen = $("#resultScreen")[0];
  return resultScreen.innerHTML = `\
*SERVER INFO*
${server1.getInfo()}

*CAPACITY PLANNING*
${capacityPlanning(targetCapacity, server1)}\
`;
};

updatePlanning();

const redoServer = function (serverType: string) {
  switch (serverType) {
    case "metal": return server1 = new BareMetal(disk1);
    case "aws": return server1 = new AWSattached(disk1);
    case "vmware": return server1 = new VMware(disk1);
  }
};

const redoDisk = function (diskType: string) {
  switch (diskType) {
    case "1DPWD": disk1 = new OneDWPD(disk1vendor); break;
    case "3DPWD": disk1 = new ThreeDWPD(disk1vendor); break;
  }
  return redoServer((<HTMLInputElement>$('#platform')[0]).value);
};


$(function () {
  $('#platform').on('change', function (event: any) {
    redoServer((<HTMLInputElement>this).value);
    return updatePlanning();
  });

  $('#diskVendor').on('change', function (event: any) {
    disk1vendor = (<HTMLInputElement>this).value;
    redoDisk((<HTMLInputElement>$('#diskType')[0]).value);
    return updatePlanning();
  });

  $('#diskType').on('change', function (event: any) {
    redoDisk((<HTMLInputElement>this).value);
    return updatePlanning();
  });

  const slider = (<HTMLInputElement>$("#capacityRange")[0]);
  const output = $("#rangeValue")[0];
  output.innerHTML = slider.value + " TB"; // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  return slider.oninput = function () {
    output.innerHTML = (<HTMLInputElement>this).value + " TB";
    targetCapacity = +(<HTMLInputElement>this).value;
    return updatePlanning();
  };
});
