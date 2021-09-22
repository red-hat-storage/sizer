import * as _ from "lodash";
import { DeepPartial } from "@reduxjs/toolkit";
import { Workload } from "../../models";
import {
  WordpressIcon,
  LinuxIcon,
  DatabaseIcon,
  GitlabIcon,
  ApplicationsIcon,
} from "@patternfly/react-icons";

type WorkloadData = Workload & {
  icon: React.ComponentClass;
  modifiers?: {
    [modifierName: string]: DeepPartial<Workload>;
  };
};

const defaultWorkloadsMap: WorkloadData[] = [
  {
    name: "WordPress",
    count: 1,
    usesMachines: ["default"],
    services: [
      {
        name: "wordpress",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["mysql"],
        avoid: [],
      },
      {
        name: "mysql",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: WordpressIcon,
    modifiers: {
      Large: { count: 1, services: [{ name: "wordpress", requiredCPU: 6 }] },
      Medium: { count: 2 },
      Small: {},
    },
  },
  {
    name: "LAMP",
    count: 1,
    usesMachines: ["default"],
    services: [
      {
        name: "wordpress",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["mysql"],
        avoid: [],
      },
      {
        name: "mysql",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: LinuxIcon,
    modifiers: { Large: { count: 3 }, Medium: { count: 2 }, Small: {} },
  },
  {
    name: "PostgreSQL",
    count: 1,
    usesMachines: ["default"],
    services: [
      {
        name: "wordpress",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["mysql"],
        avoid: [],
      },
      {
        name: "mysql",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: DatabaseIcon,
    modifiers: { Large: { count: 3 }, Medium: { count: 2 }, Small: {} },
  },
  {
    name: "Kafka",
    count: 1,
    usesMachines: ["default"],
    services: [
      {
        name: "wordpress",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["mysql"],
        avoid: [],
      },
      {
        name: "mysql",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: ApplicationsIcon,
    modifiers: { Large: { count: 3 }, Medium: { count: 2 }, Small: {} },
  },
  {
    name: "Gitlab",
    count: 1,
    usesMachines: ["default"],
    services: [
      {
        name: "wordpress",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["mysql"],
        avoid: [],
      },
      {
        name: "mysql",
        requiredCPU: 5,
        requiredMemory: 10,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: GitlabIcon,
    modifiers: { Large: { count: 3 }, Medium: { count: 2 }, Small: {} },
  },
];

export const defaultWorkloads: Workload[] = defaultWorkloadsMap.map((wl) =>
  _.omit(wl, ["icon", "modifiers"])
);
export const defaultWorkloadsIconMap: {
  [name: string]: React.ReactNode;
} = defaultWorkloadsMap.reduce((acc, curr) => {
  acc[curr.name] = curr.icon;
  return acc;
}, {} as any);
export const defaultWorkloadsModifierMap: {
  [name: string]: { [modifierName: string]: Partial<Workload> };
} = defaultWorkloadsMap.reduce((acc, curr) => {
  acc[curr.name] = curr.modifiers || {};
  return acc;
}, {} as any);
export const defaultWorkloadsNameMap: {
  [name: string]: Workload;
} = defaultWorkloads.reduce((acc, curr) => {
  acc[curr.name] = curr;
  return acc;
}, {} as any);
