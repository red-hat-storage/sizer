import { DeploymentType, Platform } from "../../types";

export type SupportExceptionObject = {
  issue: string;
  header: string;
  message: string;
};

export const TECH_PREV_PLATFORMS = [Platform.RHV, Platform.GCP];

export const getSupportExceptions: (
  flashSize: number,
  platform: Platform,
  deployment: DeploymentType
) => SupportExceptionObject[] = (flashSize, platform, deployment) => {
  const exceptions = [];
  if (flashSize > 4) {
    const message = `Currently we only test disk sizes up to 4TB. While we do not expect any issues with larger disks, we do not currently test this and thus you will need to request a support exception.`;
    exceptions.push({ issue: "DiskSize", header: "Disk exceeds 4TB", message });
  }
  if (TECH_PREV_PLATFORMS.includes(platform)) {
    const message = `You selected a platform that is currently in tech-preview. While we are confident with the results of our testing so far, not all disaster scenarios have been tested and you will need to request a support exception to run on this platform in production.<br>
    We also use these support exceptions to learn about the demand for the various platforms and to priorities which platform will be fully supported next.`;
    exceptions.push({
      issue: "Platform",
      header: "Platform in Tech Preview",
      message,
    });
  }
  if ([DeploymentType.COMPACT, DeploymentType.MINIMAL].includes(deployment)) {
    const message = `The deployment mode you selected is currently only available as Technology Preview. This means you need a support exception to be able to get support with this mode. <br>Chose the standard deployment mode to get the most stability and be able to scale out further.`;
    exceptions.push({
      issue: "DeploymentMode",
      header: "Deployment Mode in Tech Preview",
      message,
    });
  }
  return exceptions;
};
