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
    usesMachines: [],
    storageCapacityRequired: 50,
    services: [
      {
        name: "wordpress",
        requiredCPU: 2,
        requiredMemory: 5,
        zones: 1,
        runsWith: ["MySQL"],
        avoid: [],
      },
      {
        name: "MySQL",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: ["wordpress"],
        avoid: [],
      },
    ],
    icon: WordpressIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          { name: "wordpress", requiredCPU: 3, requiredMemory: 7 },
          { name: "MySQL", requiredCPU: 2, requiredMemory: 3 },
        ],
      },
      Large: {
        services: [
          { name: "wordpress", requiredCPU: 4, requiredMemory: 10 },
          { name: "MySQL", requiredCPU: 3, requiredMemory: 5 },
        ],
      },
    },
  },
  {
    name: "LAMP",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "Apache",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: ["MySQL"],
        avoid: [],
      },
      {
        name: "MySQL",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: ["Apache"],
        avoid: [],
      },
    ],
    icon: LinuxIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [{ name: "MySQL", requiredCPU: 2, requiredMemory: 3 }],
      },
      Large: {
        services: [{ name: "MySQL", requiredCPU: 3, requiredMemory: 5 }],
      },
    },
  },
  {
    name: "PostgreSQL",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "PostgreSQL",
        requiredCPU: 2,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: DatabaseIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [{ name: "PostgreSQL", requiredCPU: 3, requiredMemory: 5 }],
      },
      Large: {
        services: [{ name: "PostgreSQL", requiredCPU: 4, requiredMemory: 10 }],
      },
    },
  },
  {
    name: "Kafka",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 100,
    services: [
      {
        name: "Kafka-Zookeeper",
        requiredCPU: 3,
        requiredMemory: 10,
        zones: 3,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka",
        requiredCPU: 3,
        requiredMemory: 10,
        zones: 3,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Entity",
        requiredCPU: 3,
        requiredMemory: 10,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: ApplicationsIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [{ name: "PostgreSQL", requiredCPU: 5, requiredMemory: 10 }],
      },
      Large: {},
    },
  },
  {
    name: "Gitlab",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 200,
    services: [
      {
        name: "PostgreSQL",
        requiredCPU: 3,
        requiredMemory: 5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Redis",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "MinIO",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Prometheus",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Gitlab",
        requiredCPU: 3,
        requiredMemory: 20,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: GitlabIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          { name: "PostgreSQL", requiredCPU: 3, requiredMemory: 7 },
          { name: "Redis", requiredCPU: 1, requiredMemory: 5 },
          { name: "MinIO", requiredCPU: 2, requiredMemory: 7 },
          { name: "Gitlab", requiredCPU: 5, requiredMemory: 20 },
        ],
      },
      Large: {
        services: [
          { name: "PostgreSQL", requiredCPU: 3, requiredMemory: 7 },
          { name: "Redis", requiredCPU: 2, requiredMemory: 7 },
          { name: "MinIO", requiredCPU: 3, requiredMemory: 10 },
          { name: "Prometheus", requiredCPU: 2, requiredMemory: 3 },
          { name: "Gitlab", requiredCPU: 5, requiredMemory: 22 },
        ],
      },
    },
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
