import AWS from "./AWS.json";
import AZURE from "./AZURE.json";
import GCP from "./GCP.json";
import IBMClassic from "./IBM-classic.json";
import IBMVpc from "./IBM-vpc.json";

export const platformData: Record<string, any> = {
  AWS,
  AZURE,
  GCP,
  IBMClassic,
  IBMVpc,
};

export function getInstancesForPlatform(platform: string): any {
  return platformData[platform] || platformData.AWS;
}

export function getDefaultInstanceForPlatform(platform: string): any {
  const instances = getInstancesForPlatform(platform);
  return instances.find((i: any) => i.default) || instances[0];
}


