import {
  StorageClusterResource,
  ResourceConstraints,
  DeviceSet,
  EncryptionType,
  StorageClusterKind,
  Platform,
  StorageSystemKind,
} from "../types";

const getDeviceSetCount = (pvCount: number, replica: number): number =>
  Math.floor(pvCount / replica) || 1;

const OCS_DEVICE_SET_REPLICA = 3;
const OCS_DEVICE_SET_ARBITER_REPLICA = 4;
const OCS_DEVICE_SET_FLEXIBLE_REPLICA = 1;
const ATTACHED_DEVICES_ANNOTATION = "cluster.ocs.openshift.io/local-devices";

export const StorageClassMap = {
  [Platform.AWS]: "gp2",
  [Platform.GCP]: "standard",
  [Platform.BAREMETAL]: "default",
  [Platform.RHV]: "default",
  [Platform.VMware]: "thin",
  [Platform.AZURE]: "azure-managed-disk",
};

const MIN_SPEC_RESOURCES: StorageClusterResource = {
  mds: {
    limits: {
      cpu: "3",
      memory: "8Gi",
    },
    requests: {
      cpu: "1",
      memory: "8Gi",
    },
  },
  rgw: {
    limits: {
      cpu: "2",
      memory: "4Gi",
    },
    requests: {
      cpu: "1",
      memory: "4Gi",
    },
  },
};

const MIN_DEVICESET_RESOURCES: ResourceConstraints = {
  limits: {
    cpu: "2",
    memory: "5Gi",
  },
  requests: {
    cpu: "1",
    memory: "5Gi",
  },
};

const createDeviceSet = (
  scName: string,
  osdSize: string,
  portable: boolean,
  replica: number,
  count: number,
  resources?: ResourceConstraints
): DeviceSet => ({
  name: `ocs-deviceset-${scName}`,
  count,
  portable,
  replica,
  resources: resources ?? {},
  placement: {},
  dataPVCTemplate: {
    spec: {
      storageClassName: scName,
      accessModes: ["ReadWriteOnce"],
      volumeMode: "Block",
      resources: {
        requests: {
          storage: Number(osdSize) * 1024,
        },
      },
    },
  },
});

export const getOCSData = (
  storageClass: string,
  storage: string,
  encryption: EncryptionType,
  isMinimal: boolean,
  flexibleScaling = false,
  publicNetwork?: string,
  clusterNetwork?: string,
  kmsEnable?: boolean,
  selectedArbiterZone?: string,
  stretchClusterChecked?: boolean,
  availablePvsCount?: number,
  isMCG?: boolean
): StorageClusterKind => {
  const scName: string = storageClass;
  const isNoProvisioner: boolean = storageClass === "";
  const isPortable: boolean = flexibleScaling ? false : !isNoProvisioner;
  const deviceSetReplica: number = stretchClusterChecked
    ? OCS_DEVICE_SET_ARBITER_REPLICA
    : flexibleScaling
    ? OCS_DEVICE_SET_FLEXIBLE_REPLICA
    : OCS_DEVICE_SET_REPLICA;
  const deviceSetCount = getDeviceSetCount(availablePvsCount, deviceSetReplica);

  const requestData: StorageClusterKind = {
    apiVersion: "ocs.openshift.io/v1",
    kind: "StorageCluster",
    metadata: {
      name: "ocs-storagecluster",
      namespace: "openshift-storage",
    },
    spec: {},
  };

  if (isNoProvisioner) {
    // required for disk list page
    requestData.metadata.annotations = {
      [ATTACHED_DEVICES_ANNOTATION]: "true",
    };
  }

  if (isMCG) {
    // for mcg standalone deployment
    requestData.spec = {
      multiCloudGateway: {
        dbStorageClassName: scName,
        reconcileStrategy: "standalone",
      },
    };
  } else {
    // for full deployment - ceph + mcg
    requestData.spec = {
      monDataDirHostPath: isNoProvisioner ? "/var/lib/rook" : "",
      manageNodes: false,
      resources: isMinimal ? MIN_SPEC_RESOURCES : {},
      flexibleScaling,
      arbiter: {
        enable: stretchClusterChecked,
      },
      nodeTopologies: {
        arbiterLocation: selectedArbiterZone,
      },
      storageDeviceSets: [
        createDeviceSet(
          scName,
          storage,
          isPortable,
          deviceSetReplica,
          deviceSetCount,
          isMinimal ? MIN_DEVICESET_RESOURCES : {}
        ),
      ],
      ...Object.assign(
        publicNetwork || clusterNetwork
          ? {
              network: {
                provider: "multus",
                selectors: {
                  ...Object.assign(
                    publicNetwork ? { public: publicNetwork } : {}
                  ),
                  ...Object.assign(
                    clusterNetwork ? { cluster: clusterNetwork } : {}
                  ),
                },
              },
            }
          : {}
      ),
    };
  }

  if (encryption) {
    requestData.spec.encryption = {
      enable: encryption.clusterWide,
      clusterWide: encryption.clusterWide,
      storageClass: encryption.storageClass,
      kms: {
        enable: kmsEnable,
      },
    };
  }

  return requestData;
};

export const getODFData = (): StorageSystemKind => ({
  apiVersion: "odf.openshift.io/v1alpha1",
  kind: "StorageSystem",
  metadata: {
    name: `ocs-storagecluster-storagesystem`,
    namespace: "openshift-storage",
  },
  spec: {
    name: "ocs-storagecluster",
    kind: "ocs.openshift.io/v1",
    namespace: "openshift-storage",
  },
});
