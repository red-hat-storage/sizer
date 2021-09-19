import * as _ from "lodash";
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
  modifiers?: string[];
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
    modifiers: ["Large", "Medium", "Small"],
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
    modifiers: ["Large", "Medium", "Small"],
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
    modifiers: ["Large", "Medium", "Small"],
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
    modifiers: ["Large", "Medium", "Small"],
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
    modifiers: ["Large", "Medium", "Small"],
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
  [name: string]: string[];
} = defaultWorkloadsMap.reduce((acc, curr) => {
  acc[curr.name] = curr.modifiers;
  return acc;
}, {} as any);
