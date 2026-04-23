import { Instance, Platform } from "./types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const awsInstances = require("../AWS.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gcpInstances = require("../GCP.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const azureInstances = require("../AZURE.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ibmClassicInstances = require("../IBM-classic.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ibmVPCInstances = require("../IBM-vpc.json");

type IBM = Platform.IBMC | Platform.IBMV;

type CloudPlatForm = Platform.AWS | Platform.AZURE | Platform.GCP | IBM;

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
  [Platform.IBMC]: {
    odfDefault: "b3c.16x64",
    ocpDefault: "u3c.2x4",
    controlPlane: "b3c.4x16",
  },
  [Platform.IBMV]: {
    odfDefault: "bx2.16x64",
    ocpDefault: "bx2.2x8",
    controlPlane: "bx2.4x16",
  },
};

type ParsedStorage = {
  maxDisks: number;
  instanceStorage: number;
  storageType: string;
};

const parseInstanceStorage = (
  storage: [number, number, string] | undefined,
  defaultMaxDisks = 24
): ParsedStorage => {
  if (!storage) {
    return { maxDisks: defaultMaxDisks, instanceStorage: 0, storageType: "" };
  }
  return {
    maxDisks: storage[0],
    instanceStorage: storage[1],
    storageType: storage[2],
  };
};

const AWSInstances: Instance[] = awsInstances.map((instance) => {
  const { maxDisks, instanceStorage, storageType } = parseInstanceStorage(
    instance.instanceStorage
  );
  return {
    name: instance.name,
    cpuUnits: instance.cpu,
    instanceStorage,
    storageType,
    maxDisks,
    memory: instance.memory,
  };
});

const GCPInstances: Instance[] = gcpInstances.map((instance) => {
  const { maxDisks, instanceStorage, storageType } = parseInstanceStorage(
    instance.instanceStorage,
    127
  );
  return {
    name: instance.name,
    cpuUnits: instance.cpu,
    instanceStorage,
    maxDisks,
    storageType,
    memory: instance.memory,
  };
});

const AzureInstances: Instance[] = azureInstances.map((instance) => {
  const { instanceStorage, storageType } = parseInstanceStorage(
    instance.instanceStorage
  );
  return {
    name: instance.name,
    cpuUnits: instance.cpu,
    memory: instance.memory,
    instanceStorage,
    storageType,
    maxDisks: instance.maxDisks,
  };
});

const IBMClassicInstances: Instance[] = ibmClassicInstances
  .filter(({ ocp_unsupported }) => !ocp_unsupported)
  .map((instance) => {
    const { maxDisks, instanceStorage, storageType } = parseInstanceStorage(
      instance.instanceStorage
    );
    return {
      name: instance.name,
      cpuUnits: instance.cpu,
      memory: instance.memory,
      instanceStorage,
      storageType,
      maxDisks,
    };
  });

const IBMVPCInstances: Instance[] = ibmVPCInstances
  .filter(({ ocp_unsupported }) => !ocp_unsupported)
  .map((instance) => {
    const { maxDisks, instanceStorage, storageType } = parseInstanceStorage(
      instance.instanceStorage
    );
    return {
      name: instance.name,
      cpuUnits: instance.cpu,
      memory: instance.memory,
      instanceStorage,
      storageType,
      maxDisks,
    };
  });

export const platformInstanceMap: PlatformInstanceMap = {
  [Platform.AWS]: AWSInstances,
  [Platform.AZURE]: AzureInstances,
  [Platform.GCP]: GCPInstances,
  [Platform.IBMC]: IBMClassicInstances,
  [Platform.IBMV]: IBMVPCInstances,
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
  [Platform.IBMC]: platformInstanceMap[Platform.IBMC].find(
    isDefault(Platform.IBMC)
  ) as Instance,
  [Platform.IBMV]: platformInstanceMap[Platform.IBMV].find(
    isDefault(Platform.IBMV)
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
  [Platform.IBMC]: platformInstanceMap[Platform.IBMC].find(
    isControlPlane(Platform.IBMC)
  ) as Instance,
  [Platform.IBMV]: platformInstanceMap[Platform.IBMV].find(
    isControlPlane(Platform.IBMV)
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
  [Platform.IBMC]: platformInstanceMap[Platform.IBMC].find(
    isODFInstance(Platform.IBMC)
  ) as Instance,
  [Platform.IBMV]: platformInstanceMap[Platform.IBMV].find(
    isODFInstance(Platform.IBMV)
  ) as Instance,
  [Platform.VMware]: {
    cpuUnits: 16,
    memory: 64,
    name: "odfDefault",
  },
  [Platform.RHV]: {
    cpuUnits: 16,
    memory: 64,
    name: "odfDefault",
  },
  [Platform.BAREMETAL]: {
    cpuUnits: 16,
    memory: 64,
    name: "odfDefault",
  },
}))();
