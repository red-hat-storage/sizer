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

type WorkloadData = Omit<Workload, "uid"> & {
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
        name: "WordPress",
        requiredCPU: 2,
        requiredMemory: 5,
        zones: 1,
        runsWith: ["WordPress-MySQL"],
        avoid: [],
      },
      {
        name: "WordPress-MySQL",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: ["WordPress"],
        avoid: [],
      },
    ],
    icon: WordpressIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          { name: "WordPress", requiredCPU: 3, requiredMemory: 7 },
          { name: "WordPress-MySQL", requiredCPU: 2, requiredMemory: 3 },
        ],
      },
      Large: {
        services: [
          { name: "WordPress", requiredCPU: 4, requiredMemory: 10 },
          { name: "WordPress-MySQL", requiredCPU: 3, requiredMemory: 5 },
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
        name: "LAMP-Apache",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: ["MySQL"],
        avoid: [],
      },
      {
        name: "LAMP-MySQL",
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
        services: [{ name: "LAMP-MySQL", requiredCPU: 2, requiredMemory: 3 }],
      },
      Large: {
        services: [{ name: "LAMP-MySQL", requiredCPU: 3, requiredMemory: 5 }],
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
        name: "Gitlab-PostgreSQL",
        requiredCPU: 3,
        requiredMemory: 5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Gitlab-Redis",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Gitlab-MinIO",
        requiredCPU: 1,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Gitlab-Prometheus",
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
          { name: "Gitlab-PostgreSQL", requiredCPU: 3, requiredMemory: 7 },
          { name: "Gitlab-Redis", requiredCPU: 1, requiredMemory: 5 },
          { name: "Gitlab-MinIO", requiredCPU: 2, requiredMemory: 7 },
          { name: "Gitlab", requiredCPU: 5, requiredMemory: 20 },
        ],
      },
      Large: {
        services: [
          { name: "Gitlab-PostgreSQL", requiredCPU: 3, requiredMemory: 7 },
          { name: "Gitlab-Redis", requiredCPU: 2, requiredMemory: 7 },
          { name: "Gitlab-MinIO", requiredCPU: 3, requiredMemory: 10 },
          { name: "Gitlab-Prometheus", requiredCPU: 2, requiredMemory: 3 },
          { name: "Gitlab", requiredCPU: 5, requiredMemory: 22 },
        ],
      },
    },
  },
];

export const defaultWorkloads: Omit<
  Workload,
  "uid"
>[] = defaultWorkloadsMap.map((wl) => _.omit(wl, ["icon", "modifiers"]));
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
