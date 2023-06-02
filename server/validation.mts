import { default as AWSInstances } from "../AWS.json";
import { default as GCPInstances } from "../GCP.json";
import { default as AzureInstances } from "../AZURE.json";
import { default as ibmClassicInstances } from "../IBM-classic.json";
import { default as ibmVPCInstances } from "../IBM-vpc.json";

const AWS_INSTANCE_NAMES = AWSInstances.map((val) => val.name);
const AZURE_INSTANCE_NAMES = AzureInstances.map((val) => val.name);
const GCP_INSTANCE_NAMES = GCPInstances.map((val) => val.name);
const IBMC_INSTANCE_NAMES = ibmClassicInstances.map((val) => val.name);
const IBMV_INSTANCE_NAMES = ibmVPCInstances.map((val) => val.name);

const isValidAWSInstanceName = (instanceName: string) =>
  AWS_INSTANCE_NAMES.includes(instanceName);
const isValidAzureInstanceName = (instanceName: string) =>
  AZURE_INSTANCE_NAMES.includes(instanceName);
const isValidGCPInstanceName = (instanceName: string) =>
  GCP_INSTANCE_NAMES.includes(instanceName);
const isValidIBMCInstanceName = (instanceName: string) =>
  IBMC_INSTANCE_NAMES.includes(instanceName);
const isValidIBMVInstanceName = (instanceName: string) =>
  IBMV_INSTANCE_NAMES.includes(instanceName);

const enum Platform {
  BAREMETAL = "BareMetal",
  GCP = "GCP",
  AZURE = "AZURE",
  VMware = "VMware",
  RHV = "RHV",
  AWS = "AWS",
  IBMC = "IBM-Classic",
  IBMV = "IBM-VPC",
}

const isCloudPlatform = (platform: Platform): boolean =>
  [
    Platform.AWS,
    Platform.AZURE,
    Platform.GCP,
    Platform.IBMC,
    Platform.IBMV,
  ].includes(platform);

const validateInstanceName = (instanceName: string, platformName: Platform) => {
  if (isCloudPlatform(platformName)) {
    switch (platformName) {
      case Platform.AWS:
        return isValidAWSInstanceName(instanceName);
      case Platform.GCP:
        return isValidGCPInstanceName(instanceName);
      case Platform.AZURE:
        return isValidAzureInstanceName(instanceName);
      case Platform.IBMC:
        return isValidIBMCInstanceName(instanceName);
      case Platform.IBMV:
        return isValidIBMVInstanceName(instanceName);
    }
  }
  return true;
};

export const isValidPlatformName = (platformName: string): boolean | Error => {
  if (isCloudPlatform(platformName as Platform)) {
    return true;
  } else if (
    platformName === Platform.BAREMETAL ||
    platformName === Platform.RHV ||
    platformName === Platform.VMware
  ) {
    return true;
  }
  throw new Error(
    `Invalid platform name is provided. Valid values are: ${Platform.AWS}, ${Platform.AZURE}, ${Platform.BAREMETAL}, ${Platform.GCP}, ${Platform.IBMC}, ${Platform.IBMV}, ${Platform.RHV}, ${Platform.VMware} `
  );
};

export const isValidInstanceName = (
  instanceName: string,
  platformName: string
): boolean | Error => {
  if (validateInstanceName(instanceName, platformName as Platform)) {
    return true;
  }
  throw new Error(
    `Invalid instance name ${instanceName} value used for platform ${platformName}`
  );
};
