import { Instance, Platform } from "./types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const awsInstances = require("../AWS.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gcpInstances = require("../GCP.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const azureInstances = require("../AZURE.json");
import * as _ from "lodash";

type CloudPlatForm = Platform.AWS | Platform.AZURE | Platform.GCP;

type PlatformInstanceMap = {
  [platform in CloudPlatForm]: Instance[];
};

const defaults = {
  [Platform.AWS]: {
    ocpDefault: "m5.large",
    odfDefault: "m5.4xlarge",
    controlPlane: "m5.xlarge",
  },
  [Platform.GCP]: {
    odfDefault: "e2-standard-16",
    ocpDefault: "n2-standard-2",
    controlPlane: "n2-standard-4",
  },
  [Platform.AZURE]: {
    odfDefault: "Standard_D16_v3",
    ocpDefault: "Standard_D2_v3",
    controlPlane: "Standard_D8s_v3",
  },
};

const parseAWSInstanceStorage = (
  storage: string | [number, number, string]
) => {
  let maxDisks = 24;
  let instanceStorage = 0;
  let storageType = "EBS";
  if (typeof storage === "string") {
    maxDisks = 24;
    instanceStorage = 0;
  }
  if (_.isArray(storage)) {
    // First is max Disks
    maxDisks = storage[0];
    instanceStorage = storage[1];
    storageType = storage[2];
  }
  return { maxDisks, instanceStorage, storageType };
};

const AWSInstances: Instance[] = awsInstances?.map((instance) => {
  const { maxDisks, instanceStorage, storageType } = parseAWSInstanceStorage(
    instance.instanceStorage as string | [number, number, string]
  );
  return {
    name: instance.name,
    cpuUnits: instance.cpu,
    instanceStorage: instanceStorage,
    storageType,
    maxDisks,
    memory: instance.memory,
  };
});

const parseGCPInstanceStorage = (storage: string) => {
  let maxDisks = 127;
  let instanceStorage = 0;
  let storageType = "Persistent Disk";

  if (storage.toLowerCase() === "supported") {
    maxDisks = 9;
    instanceStorage = 375;
    storageType = "SSD";
  }
  return { maxDisks, instanceStorage, storageType };
};

const GCPInstances: Instance[] = gcpInstances.map((instance) => {
  const { maxDisks, instanceStorage, storageType } = parseGCPInstanceStorage(
    instance.ssd
  );
  return {
    name: instance.name,
    cpuUnits: instance.cpus,
    instanceStorage,
    maxDisks,
    storageType,
    memory: instance.memory,
  };
});

const toTB = (memory: number) => memory / 1024;

const AzureInstances: Instance[] = azureInstances.map(
  ({ name, cpu, memory, instanceStorage, maxDisks }) => {
    return {
      name,
      cpuUnits: cpu,
      memory: toTB(memory),
      instanceStorage: toTB(instanceStorage),
      maxDisks,
    };
  }
);

export const platformInstanceMap: PlatformInstanceMap = {
  [Platform.AWS]: AWSInstances,
  [Platform.AZURE]: AzureInstances,
  [Platform.GCP]: GCPInstances,
};

const isDefault = (platform: Platform) => (item: Instance) =>
  item.name === defaults[platform].ocpDefault;

export const defaultInstances: { [platform in Platform]: Instance } = (() => ({
  [Platform.AWS]: platformInstanceMap.AWS.find(
    isDefault(Platform.AWS)
  ) as Instance,
  [Platform.AZURE]: platformInstanceMap.AZURE.find(
    isDefault(Platform.AZURE)
  ) as Instance,
  [Platform.GCP]: platformInstanceMap.GCP.find(
    isDefault(Platform.GCP)
  ) as Instance,
  [Platform.VMware]: {
    cpuUnits: 40,
    memory: 128,
    name: "default",
  } as Instance,
  [Platform.RHV]: {
    cpuUnits: 40,
    memory: 128,
    name: "default",
  } as Instance,
  [Platform.BAREMETAL]: {
    cpuUnits: 24,
    memory: 64,
    name: "default",
  } as Instance,
}))();

const isControlPlane = (platform: Platform) => (item: Instance) =>
  item.name === defaults[platform].controlPlane;

export const controlPlaneInstances: {
  [platform in Platform]: Instance;
} = (() => ({
  [Platform.AWS]: platformInstanceMap.AWS.find(
    isControlPlane(Platform.AWS)
  ) as Instance,
  [Platform.AZURE]: platformInstanceMap.AZURE.find(
    isControlPlane(Platform.AZURE)
  ) as Instance,
  [Platform.GCP]: platformInstanceMap.GCP.find(
    isControlPlane(Platform.GCP)
  ) as Instance,
  [Platform.VMware]: {
    cpuUnits: 6,
    memory: 16,
    name: "controlPlane",
  } as Instance,
  [Platform.RHV]: {
    cpuUnits: 6,
    memory: 16,
    name: "controlPlane",
  } as Instance,
  [Platform.BAREMETAL]: {
    cpuUnits: 6,
    memory: 16,
    name: "controlPlane",
  } as Instance,
}))();

const isODFInstance = (platform: Platform) => (item: Instance) =>
  defaults[platform].odfDefault === item.name;

export const defaultODFInstances: {
  [platform in Platform]: Instance;
} = (() => ({
  [Platform.AWS]: platformInstanceMap.AWS.find(
    isODFInstance(Platform.AWS)
  ) as Instance,
  [Platform.AZURE]: platformInstanceMap.AZURE.find(
    isODFInstance(Platform.AZURE)
  ) as Instance,
  [Platform.GCP]: platformInstanceMap.GCP.find(
    isODFInstance(Platform.GCP)
  ) as Instance,
  [Platform.VMware]: {
    cpuUnits: 6,
    memory: 16,
    name: "odfDefault",
  },
  [Platform.RHV]: {
    cpuUnits: 6,
    memory: 16,
    name: "odfDefault",
  },
  [Platform.BAREMETAL]: {
    cpuUnits: 6,
    memory: 16,
    name: "odfDefault",
  },
}))();
