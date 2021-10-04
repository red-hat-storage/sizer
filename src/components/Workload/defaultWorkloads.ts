import * as _ from "lodash";
import { DeepPartial } from "@reduxjs/toolkit";
import { Workload } from "../../models";
import {
  WordpressIcon,
  LinuxIcon,
  DatabaseIcon,
  GitlabIcon,
  ApplicationsIcon,
  FileAltIcon,
  UndoIcon,
  NetworkWiredIcon,
  DiagnosesIcon,
  EyeIcon,
} from "@patternfly/react-icons";

type WorkloadData = Omit<Workload, "uid"> & {
  icon: React.ComponentClass;
  modifiers?: {
    [modifierName: string]: DeepPartial<Workload>;
  };
};

const defaultWorkloadsMap: WorkloadData[] = [
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
    icon: NetworkWiredIcon,
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
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-managing-compute-resources.html
  // Contact Andrew Sullivan
  // THIS IS A COPY OF ELASTICSEARCH WITH FLUENTD
  {
    name: "Logging",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "Log-APM",
        requiredCPU: 1,
        requiredMemory: 0.5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-ElasticSearch",
        requiredCPU: 4,
        requiredMemory: 2,
        zones: 2,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Kibana",
        requiredCPU: 0.5,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Beat",
        requiredCPU: 0.2,
        requiredMemory: 0.2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Agent",
        requiredCPU: 0.5,
        requiredMemory: 0.3,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Maps",
        requiredCPU: 0.2,
        requiredMemory: 0.2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Search",
        requiredCPU: 2,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Log-Fluentd",
        requiredCPU: 0.1,
        requiredMemory: 0.75,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: FileAltIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          {
            name: "Log-APM",
            requiredCPU: 2,
            requiredMemory: 2,
          },
          {
            name: "Log-ElasticSearch",
            requiredCPU: 8,
            requiredMemory: 4,
            zones: 3,
          },
          {
            name: "Log-Kibana",
            zones: 2,
          },
          {
            name: "Log-Beat",
            requiredCPU: 0.5,
            requiredMemory: 0.5,
          },
          {
            name: "Log-Maps",
            requiredCPU: 1,
            requiredMemory: 1,
          },
          {
            name: "Log-Fluentd",
            requiredCPU: 0.25,
            requiredMemory: 1,
          },
        ],
      },
      Large: {
        services: [
          {
            name: "Log-APM",
            requiredCPU: 2,
            requiredMemory: 2,
          },
          {
            name: "Log-ElasticSearch",
            requiredCPU: 8,
            requiredMemory: 8,
            zones: 3,
          },
          {
            name: "Log-Kibana",
            requiredCPU: 1,
            requiredMemory: 2,
            zones: 2,
          },
          {
            name: "Log-Beat",
            requiredCPU: 0.5,
            requiredMemory: 0.5,
          },
          {
            name: "Log-Maps",
            requiredCPU: 1,
            requiredMemory: 1,
          },
          {
            name: "Log-Fluentd",
            requiredCPU: 0.5,
            requiredMemory: 1.5,
          },
        ],
      },
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  {
    name: "Jaeger",
    count: 10,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "Jaeger-Collector",
        requiredCPU: 0.1,
        requiredMemory: 0.125,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: EyeIcon,
    modifiers: {
      Default: {},
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  // Needs Jaeger and optional Elasticsearch as well
  {
    name: "ServiceMesh",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "ServiceMesh-Control Plane",
        requiredCPU: 1.3,
        requiredMemory: 0.75,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ServiceMesh-Kiali",
        requiredCPU: 1,
        requiredMemory: 3,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: NetworkWiredIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          {
            name: "ServiceMesh-Control Plane",
            requiredCPU: 1.6,
            requiredMemory: 1.75,
          },
        ],
      },
      Large: {
        services: [
          {
            name: "ServiceMesh-Control Plane",
            requiredCPU: 2.75,
            requiredMemory: 2,
          },
        ],
      },
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  {
    name: "ArgoCD",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "ArgoCD",
        requiredCPU: 5,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: UndoIcon,
    modifiers: {
      Default: {},
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-managing-compute-resources.html
  // Contact Andrew Sullivan
  {
    name: "Elasticsearch",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "ES-APM",
        requiredCPU: 1,
        requiredMemory: 0.5,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ElasticSearch",
        requiredCPU: 4,
        requiredMemory: 2,
        zones: 2,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ES-Kibana",
        requiredCPU: 0.5,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ES-Beat",
        requiredCPU: 0.2,
        requiredMemory: 0.2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ES-Agent",
        requiredCPU: 0.5,
        requiredMemory: 0.3,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ES-Maps",
        requiredCPU: 0.2,
        requiredMemory: 0.2,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "ES-Search",
        requiredCPU: 2,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: DiagnosesIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [
          {
            name: "ES-APM",
            requiredCPU: 2,
            requiredMemory: 2,
          },
          {
            name: "ElasticSearch",
            requiredCPU: 8,
            requiredMemory: 4,
            zones: 3,
          },
          {
            name: "ES-Kibana",
            zones: 2,
          },
          {
            name: "ES-Beat",
            requiredCPU: 0.5,
            requiredMemory: 0.5,
          },
          {
            name: "ES-Maps",
            requiredCPU: 1,
            requiredMemory: 1,
          },
        ],
      },
      Large: {
        services: [
          {
            name: "ES-APM",
            requiredCPU: 2,
            requiredMemory: 2,
          },
          {
            name: "ElasticSearch",
            requiredCPU: 8,
            requiredMemory: 8,
            zones: 3,
          },
          {
            name: "ES-Kibana",
            requiredCPU: 1,
            requiredMemory: 2,
            zones: 2,
          },
          {
            name: "ES-Beat",
            requiredCPU: 0.5,
            requiredMemory: 0.5,
          },
          {
            name: "ES-Maps",
            requiredCPU: 1,
            requiredMemory: 1,
          },
        ],
      },
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  {
    name: "GitLab Runner",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "GLRunner-Operator",
        requiredCPU: 0.1,
        requiredMemory: 0.125,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "GLRunner-Build",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "GLRunner-Service",
        requiredCPU: 1,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "GLRunner-Helper",
        requiredCPU: 1,
        requiredMemory: 1,
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
          {
            name: "GLRunner-Build",
            requiredCPU: 2,
            requiredMemory: 4,
          },
          {
            name: "GLRunner-Service",
            requiredCPU: 2,
            requiredMemory: 4,
          },
          {
            name: "GLRunner-Helper",
            requiredCPU: 2,
            requiredMemory: 4,
          },
        ],
      },
      Large: {
        services: [
          {
            name: "GLRunner-Build",
            requiredCPU: 4,
            requiredMemory: 8,
          },
          {
            name: "GLRunner-Service",
            requiredCPU: 4,
            requiredMemory: 8,
          },
          {
            name: "GLRunner-Helper",
            requiredCPU: 4,
            requiredMemory: 8,
          },
        ],
      },
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  {
    name: "Dynatrace",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "Dynatrace-Operator",
        requiredCPU: 0.1,
        requiredMemory: 0.25,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Dynatrace-ActiveGate",
        requiredCPU: 0.3,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
      {
        name: "Dynatrace-K8s-Monitor",
        requiredCPU: 0.3,
        requiredMemory: 1,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: EyeIcon,
    modifiers: {
      Default: {},
    },
  },
  // Sizing info from
  // https://docs.google.com/document/d/1b-KI4hFLvE0fYLtYsK5Em-QT46ii8bgyRIrgfLhrYuM
  // Contact Andrew Sullivan
  {
    name: "PostgreSQL",
    count: 1,
    usesMachines: [],
    storageCapacityRequired: 30,
    services: [
      {
        name: "PostgreSQL",
        requiredCPU: 2,
        requiredMemory: 4,
        zones: 1,
        runsWith: [],
        avoid: [],
      },
    ],
    icon: DatabaseIcon,
    modifiers: {
      Small: {},
      Medium: {
        services: [{ name: "PostgreSQL", requiredCPU: 4, requiredMemory: 16 }],
      },
      Large: {
        services: [{ name: "PostgreSQL", requiredCPU: 8, requiredMemory: 32 }],
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
