// https://sizer.ocs.ninja/?p=BareMetal&nc=16&nm=64&fs=6&uc=250&dt=internal&nt=false&ca=true&na=true&ra=true
// here legacy means v1 of the sizer tool
export const isLegacyURL = (url: URLSearchParams): boolean => url.has("p");

type URLParameters =
  | "platform"
  | "cpu"
  | "memory"
  | "diskSize"
  | "usableCapacity"
  | "deploymentType"
  | "nvmeTuning"
  | "cephFSActive"
  | "noobaaActive"
  | "rgwActive";

export const handleLegacyURL = (
  url: URLSearchParams
): Record<URLParameters, string | null> => {
  const platform = url.get("p");
  const cpu = url.get("nc");
  const memory = url.get("nm");
  const diskSize = url.get("fs");
  const usableCapacity = url.get("uc");
  const deploymentType = url.get("dt");
  const nvmeTuning = url.get("nt");
  const cephFSActive = url.get("ca");
  const noobaaActive = url.get("na");
  const rgwActive = url.get("ra");
  return {
    platform,
    cpu,
    memory,
    diskSize,
    usableCapacity,
    deploymentType,
    nvmeTuning,
    cephFSActive,
    noobaaActive,
    rgwActive,
  };
};
