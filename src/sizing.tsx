import sizingData from "./sizingData.json";

interface SizingItem {
  Environment: string; // "Bare Metal"
  "Node Qty": string; // "3"
  "Device Vendor": string; // "Intel"
  Device: string; // "Intel DC P4610 NVMe SSD (U.2) -  1.6 TB "
  "Devices Per Node": string; // "0.00"
  "Devices Per Cluster": string; // "0"
  "Device Size": string; // "1.6"
  "Usable (TB)": string; // "0"
  "Max PVs": string; // "0"
  "Minimum Node CPU (OCS)": string; // "8.00"
  "Actual Node CPU": string; // "16"
  "Machine Type": string; // "Dual Intel Xeon Gold 6244, 96GB Memory"
  "Minimum Node MEM (OCS)": string; // "32.00"
}

interface SizingInfo {
  envNames: string[];
  envs: {
    [env: string]: {
      vendorNames: string[];
      vendors: {
        [vendor: string]: {
          sizing: Array<SizingItem>;
        };
      };
    };
  };
}

const emptySizingItem: SizingItem = {
  Environment: "NA",
  "Node Qty": "0",
  "Device Vendor": "NA",
  Device: "NA",
  "Devices Per Node": "0",
  "Devices Per Cluster": "0",
  "Device Size": "0",
  "Usable (TB)": "0",
  "Max PVs": "0",
  "Minimum Node CPU (OCS)": "0",
  "Actual Node CPU": "0",
  "Machine Type": "NA",
  "Minimum Node MEM (OCS)": "0"
};

let sizingInfo: SizingInfo;

export const useSizingInfo = () => {
  if (sizingInfo) return sizingInfo;

  sizingInfo = { envNames: [], envs: {} };

  sizingData.forEach((s: SizingItem) => {
    const env = (sizingInfo.envs[s.Environment] = sizingInfo.envs[
      s.Environment
    ] || {
      vendorNames: [],
      vendors: {}
    });
    const vendor = (env.vendors[s["Device Vendor"]] = env.vendors[
      s["Device Vendor"]
    ] || { sizing: [] });
    if (!sizingInfo.envNames.includes(s.Environment)) {
      sizingInfo.envNames.push(s.Environment);
    }
    if (!env.vendorNames.includes(s["Device Vendor"])) {
      env.vendorNames.push(s["Device Vendor"]);
    }
    vendor.sizing.push(s);
  });

  for (const env of Object.values(sizingInfo.envs)) {
    for (const vendor of Object.values(env.vendors)) {
      vendor.sizing.sort((a, b) => {
        const x = Number(a["Usable (TB)"]);
        const y = Number(b["Usable (TB)"]);
        return x - y;
      });
    }
  }

  return sizingInfo;
};

export const getNextFitSizing = (
  envName: string,
  vendorName: string,
  usableTB: number
): SizingItem => {
  const env = sizingInfo.envs[envName];
  if (!env) return emptySizingItem;
  const vendor = env.vendors[vendorName];
  if (!vendor) return emptySizingItem;
  for (const s of vendor.sizing) {
    const n = Number(s["Usable (TB)"]);
    if (n >= usableTB) return s;
  }
  return emptySizingItem;
};
