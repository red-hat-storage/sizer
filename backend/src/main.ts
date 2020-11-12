abstract class Server {
  static maxDisks: number;
  static cpuCores: number;
  static memory: number;
  diskType: NVMe;

  constructor(diskType: NVMe) {
    this.diskType = diskType;
  }

  maxCapacity() {
    return this.diskType.maxCapacity() * Server.maxDisks;
  }

  getInfo() {
    return `\
Maximum number of disks per server: ${Server.maxDisks}
Maximum capacity of one server: ${this.maxCapacity()} TB
Disk vendor: ${this.diskType.vendor}
Server disk choices ${NVMe.capacities.join(" TB, ")} TB
Biggest available disk is ${this.diskType.maxCapacity()} TB\
`;
  }
}

class BareMetal extends Server {
  static maxDisks = 8;
}

class VMware extends Server {
  static maxDisks = 8;
}

class AWSattached extends Server {
    // instance storage i3en.2xl
    static maxDisks = 2;
}

// class AWSEBS extends Server {
//     // instance with EBS m5.4xl
//     static maxDisks = 8;
//     static cpuCores = 16;
// }

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

// abstract class Service {
//   static requiredMemory: number;
//   static requiredCPU: number;
// }

// class Noobaa_core extends Service {
//   static requiredMemory = 4;
//   static requiredCPU = 1;
// }

// class Noobaa_DB extends Service {
//   static requiredMemory = 4;
//   static requiredCPU = 0.5;
// }

// class Noobaa_Endpoint extends Service {
//   static requiredMemory = 2;
//   static requiredCPU = 1;
// }

// class Ceph_MDS extends Service {
//   static requiredMemory = 8;
//   static requiredCPU = 3;
// }

// class Ceph_MGR extends Service {
//   static requiredMemory = 3;
//   static requiredCPU = 1;
// }

// class Ceph_MON extends Service {
//   static requiredMemory = 2;
//   static requiredCPU = 1;
// }

// class Ceph_OSD extends Service {
//   static requiredMemory = 5;
//   static requiredCPU = 2;
// }

// class Ceph_RGW extends Service {
//   static requiredMemory = 4;
//   static requiredCPU = 2;
// }


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
  $('#platform').on('change', function () {
    redoServer((<HTMLInputElement>this).value);
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

  // Update the current slider value (each time you drag the slider handle)
  return slider.oninput = function () {
    output.innerHTML = (<HTMLInputElement>this).value + " TB";
    targetCapacity = +(<HTMLInputElement>this).value;
    return updatePlanning();
  };
});
