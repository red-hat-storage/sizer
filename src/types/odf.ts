export type ObjectMetadata = {
  annotations?: { [key: string]: string };
  labels?: { [key: string]: string };
  name?: string;
  namespace?: string;
};

export type K8sResourceCommon = {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMetadata;
};

export type StorageClusterKind = K8sResourceCommon & {
  // https://pkg.go.dev/github.com/red-hat-storage/ocs-operator/api/v1#StorageCluster
  spec: {
    network?: {
      provider: string;
      selectors: {
        public: string;
        private?: string;
      };
    };
    manageNodes?: boolean;
    storageDeviceSets?: DeviceSet[];
    resources?: StorageClusterResource;
    arbiter?: {
      enable: boolean;
    };
    nodeTopologies?: {
      arbiterLocation: string;
    };
    encryption?: {
      /** @deprecated - enable is deprecated from 4.10 */
      enable: boolean;
      clusterWide: boolean;
      storageClass: boolean;
      kms?: {
        enable: boolean;
      };
    };
    flexibleScaling?: boolean;
    monDataDirHostPath?: string;
    multiCloudGateway?: {
      reconcileStrategy: string;
      dbStorageClassName: string;
    };
  };
  status?: {
    phase: string;
    failureDomain?: string;
  };
};

export type DeviceSet = {
  // https://pkg.go.dev/github.com/red-hat-storage/ocs-operator/api/v1#StorageDeviceSet
  name: string;
  count: number;
  replica: number;
  resources: ResourceConstraints;
  placement?: any;
  portable: boolean;
  dataPVCTemplate: {
    spec: {
      storageClassName: string;
      accessModes: string[];
      volumeMode: string;
      resources: {
        requests: {
          storage: string | number;
        };
      };
    };
  };
};

export type StorageClusterResource = {
  mds?: ResourceConstraints;
  rgw?: ResourceConstraints;
};

export type ResourceConstraints = {
  limits?: {
    cpu: string;
    memory: string;
  };
  requests?: {
    cpu: string;
    memory: string;
  };
};

export type EncryptionType = {
  clusterWide: boolean;
  storageClass: boolean;
  advanced: boolean;
  hasHandled: boolean;
};

export type StorageSystemKind = K8sResourceCommon & {
  spec: {
    // kind is a string as `<kind>.<apiGroup>/<apiVersion>`, describing the managed storage vendor CR
    kind: string;
    name: string;
    namespace: string;
  };
};
