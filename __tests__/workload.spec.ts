import { WorkloadDescriptor } from "../src/types";
import { getWorkloadFromDescriptors } from "../src/utils";

const simpleWLDescription: WorkloadDescriptor = {
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
  ],
};

describe("Test Workload and Service creation using `getWorkloadFromDescriptors`", () => {
  const { services, workload } =
    getWorkloadFromDescriptors(simpleWLDescription);
  it("Generates services with proper IDs", () => {
    services.forEach((service) => {
      expect(service.id).toBeGreaterThanOrEqual(0);
    });
  });

  it("Generates workload with proper ID", () => {
    expect(workload.id).toBeGreaterThanOrEqual(0);
  });

  it("Generates workload with correctly assigned Service IDs", () => {
    expect(workload.services).toEqual(services.map((service) => service.id));
  });
});
