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
  // Sizing info from
  // https://docs.google.com/document/d/1P02sMeLLGyIcfefc6TvdLklXPwTRE61hwRE9nREHbSA/edit#
  // Contact: Keith Babo kbabo@redhat.com
  {
    name: "Kafka",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 1000,
    services: [
      {
        name: "Kafka-Zookeeper",
        requiredCPU: 4,
        requiredMemory: 8,
        zones: 3,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Broker",
        requiredCPU: 12,
        requiredMemory: 64,
        zones: 3,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Connect",
        requiredCPU: 2,
        requiredMemory: 3,
        zones: 2,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Operator",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Entity",
        requiredCPU: 2,
        requiredMemory: 2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Bridge",
        requiredCPU: 4,
        // ~100 consumer&producer
        requiredMemory: 8,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Service-Registry",
        requiredCPU: 1,
        requiredMemory: 1.5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Kafka-Cruise-Control",
        requiredCPU: 1,
        requiredMemory: 0.5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: ApplicationsIcon,
    modifiers: {
      Dev: {
        services: [
          {
            name: "Kafka-Zookeeper",
            requiredCPU: 0.5,
            requiredMemory: 1,
            zones: 1,
          },
          {
            name: "Kafka-Broker",
            requiredCPU: 1,
            requiredMemory: 2,
            zones: 1,
          },
          {
            name: "Kafka-Connect",
            requiredCPU: 0,
            requiredMemory: 0,
            zones: 0,
          },
          {
            name: "Kafka-Operator",
            requiredCPU: 0.5,
            requiredMemory: 0.3,
          },
          {
            name: "Kafka-Entity",
            requiredCPU: 0.5,
            requiredMemory: 0.5,
          },
          {
            name: "Kafka-Bridge",
            requiredCPU: 1,
            // ~10 consumer&producer
            requiredMemory: 0.8,
          },
          {
            name: "Kafka-Service-Registry",
            requiredCPU: 0.3,
            requiredMemory: 1,
          },
          {
            name: "Kafka-Cruise-Control",
            requiredCPU: 0,
            requiredMemory: 0,
            zones: 0,
          },
        ],
      },
      Small: {},
      Large: {
        services: [
          {
            name: "Kafka-Zookeeper",
            requiredMemory: 16,
            zones: 5,
          },
          {
            name: "Kafka-Entity",
            requiredCPU: 4,
            requiredMemory: 4,
          },
          {
            name: "Kafka-Bridge",
            requiredCPU: 8,
            // ~1000 consumer&producer
            requiredMemory: 80,
            zones: 2,
          },
          {
            name: "Kafka-Service-Registry",
            requiredCPU: 2,
            requiredMemory: 2,
            zones: 2,
          },
          {
            name: "Kafka-Cruise-Control",
            requiredCPU: 2,
            requiredMemory: 2,
          },
        ],
      },
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
