import { ODF_WORKLOAD_NAME } from "../constants";
import { WorkloadDescriptor, DeploymentType } from "../types";

export const getODFWorkload = (
  targetCapacity: number,
  diskCapacity: number,
  deploymentType: DeploymentType,
  dedicatedMachineSets: string[] = [],
  nooBaaActive = true,
  rgwActive = true,
  cephFSActive = true,
  nvmeTuning = false
): WorkloadDescriptor => {
  const odfWorkload: WorkloadDescriptor = {
    name: ODF_WORKLOAD_NAME,
    services: [],
    storageCapacityRequired: 0,
    usesMachines: dedicatedMachineSets,
    count: 1,
  };
  odfWorkload.services.push({
    name: "Ceph_MGR",
    requiredCPU: 1,
    requiredMemory: 3.5,
    zones: 2,
    runsWith: [],
    avoid: [],
  });
  odfWorkload.services.push({
    name: "Ceph_MON", //name
    requiredCPU: 1, // CPU
    requiredMemory: 2, // Mem
    zones: 3, // Zones
    runsWith: [], // runsWith
    avoid: [], //avoids
  });
  if (rgwActive) {
    let cpu = 2;
    let mem = 4;
    switch (deploymentType) {
      case DeploymentType.EXTERNAL:
        cpu = 8;
        mem = 4;
        break;
      case DeploymentType.MINIMAL:
      case DeploymentType.COMPACT:
        cpu = 1;
        mem = 4;
        break;
    }
    odfWorkload.services.push({
      name: "Ceph_RGW", //name
      requiredCPU: cpu, // CPU
      requiredMemory: mem, // Mem
      zones: 2, // Zones
      runsWith: [], // runsWith
      avoid: [], //avoids
    });
  }
  if (cephFSActive) {
    let cpu = 3;
    let mem = 8;
    switch (deploymentType) {
      case DeploymentType.EXTERNAL:
        cpu = 4;
        mem = 8;
        break;
      case DeploymentType.MINIMAL:
      case DeploymentType.COMPACT:
        cpu = 1;
        mem = 8;
        break;
    }
    odfWorkload.services.push({
      name: "Ceph_MDS", //name
      requiredCPU: cpu, // CPU
      requiredMemory: mem, // Mem
      zones: 2, // Zones
      runsWith: [], // runsWith
      avoid: [], //avoids
    });
  }
  if (nooBaaActive) {
    odfWorkload.services.push({
      name: "NooBaa_DB",
      requiredCPU: 0.5,
      requiredMemory: 4,
      zones: 1,
      runsWith: [],
      avoid: [],
    });
    odfWorkload.services.push({
      name: "NooBaa_Endpoint",
      requiredCPU: 1,
      requiredMemory: 2,
      zones: 1,
      runsWith: [],
      avoid: [],
    });
    odfWorkload.services.push({
      name: "NooBaa_core",
      requiredCPU: 1,
      requiredMemory: 4,
      zones: 1,
      runsWith: [],
      avoid: [],
    });
    odfWorkload.services.push({
      name: "NooBaa_operator",
      requiredCPU: 0.25,
      requiredMemory: 0.5, // 512Mi
      zones: 1,
      runsWith: [],
      avoid: [],
    });
  }

  const osdsNeededForTargetCapacity = Math.ceil(targetCapacity / diskCapacity);

  let osdCPU = 2;
  let osdMem = 5;
  switch (deploymentType) {
    case DeploymentType.EXTERNAL:
      osdCPU = 4;
      osdMem = 5;
      break;
    case DeploymentType.MINIMAL:
    case DeploymentType.COMPACT:
      osdCPU = 1;
      osdMem = 5;
      break;
  }
  if (nvmeTuning) {
    // https://docs.google.com/document/d/1zqckcf4NllPvcKEHBs4wOzReG55P_GwvxdJ-1QajreY/edit#
    osdCPU = 5;
  }
  for (let i = 0; i < osdsNeededForTargetCapacity; i++) {
    odfWorkload.services.push({
      name: `Ceph_OSD_${i}`, //name
      requiredCPU: osdCPU, // CPU
      requiredMemory: osdMem, // Mem
      zones: 3, // Zones
      runsWith: [], // runsWith
      avoid: [], //avoids
    });
  }

  return odfWorkload;
};
