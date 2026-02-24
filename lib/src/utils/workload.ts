import * as _ from "lodash";
import {
  MachineSet,
  Service,
  ServiceDescriptor,
  Workload,
  WorkloadDescriptor,
} from "../types";
import { getTotalResourceRequirement } from "./common";
import { getAllCoplacedServices, sortServices } from "./service";
import {
  getNodeKubeletCPURequirements,
  getNodeKubeletMemoryRequirements,
} from "./kubelet";

// Library version: Simple ID generators (Redux removed)
let workloadIdCounter = 0;
let serviceIdCounter = 0;

const generateWorkloadID = () => ++workloadIdCounter;
const generateServiceID = () => ++serviceIdCounter;

type WorkloadDescriptorObjects = {
  services: Service[];
  workload: Workload;
};

export const getWorkloadFromDescriptors = (
  workload: WorkloadDescriptor
): WorkloadDescriptorObjects => {
  const { services } = workload;
  const serviceDescriptors: ServiceDescriptor[] = services.map((service) =>
    Object.assign({}, service, { id: generateServiceID() })
  );
  const serviceObjects: Service[] = serviceDescriptors.reduce<Service[]>(
    (acc, curr, index) => {
      const serviceObject: Partial<Service> = _.omit(curr, [
        "avoid",
        "runsWith",
      ]);
      if (!serviceDescriptors) {
        console.log(serviceDescriptors);
      }
      serviceObject.avoid = (curr.avoid || [])
        .map((item) => serviceDescriptors.find((so) => so.name === item)?.id)
        .filter((id): id is number => id !== undefined);
      serviceObject.runsWith = (curr.runsWith || [])
        .map((item) => serviceDescriptors.find((so) => so.name === item)?.id)
        .filter((id): id is number => id !== undefined);
      acc[index] = serviceObject as Service;
      return acc;
    },
    []
  );
  const serviceIDs: number[] = serviceObjects.map(
    (service) => service.id as number
  );
  const updatedWorkload: Workload = Object.assign({}, workload, {
    id: generateWorkloadID(),
    services: serviceIDs,
  });
  return { services: serviceObjects, workload: updatedWorkload };
};

export const getDescriptorFromWorkload = (
  workload: Workload,
  services: Service[]
): WorkloadDescriptor => {
  const usedServices = services.filter((service) =>
    service.id !== undefined && workload.services.includes(service.id)
  );
  const serviceDescriptors: ServiceDescriptor[] = usedServices.map((s) => {
    return Object.assign({}, s, {
      runsWith: s.runsWith
        .map((r) => services.find((serv) => serv.id === r)?.name)
        .filter((name): name is string => name !== undefined),
      avoid: s.avoid
        .map((r) => services.find((serv) => serv.id === r)?.name)
        .filter((name): name is string => name !== undefined),
    });
  });
  const workloadDescriptor: WorkloadDescriptor = Object.assign({}, workload, {
    services: serviceDescriptors,
  });
  return workloadDescriptor;
};

export const getWorkloadResourceConsumption = (
  workload: Workload,
  services: Service[]
): ReturnType<typeof getTotalResourceRequirement> => {
  const workloadServices = services.filter((service) =>
    workload.services.includes(service.id as number)
  );
  return getTotalResourceRequirement(workloadServices);
};

// Library version: Removal functions not needed (no Redux state management)
// State mutations are handled by returning new state objects
// export const removeWorkloadSafely = (...) - REMOVED

export const isWorkloadSchedulable =
  (services: Service[], machineSets: MachineSet[]) =>
  (workload: Workload): [boolean, MachineSet[]] => {
    // First check if the workload uses some machine
    const serviceObjects: Service[] = services.filter((service) =>
      service.id !== undefined && workload.services.includes(service.id)
    );
    const coplacedServices = getAllCoplacedServices(serviceObjects);
    const sortedServices = coplacedServices.sort(sortServices);
    const { usesMachines } = workload;
    if (usesMachines.length > 0) {
      const preferredMS: MachineSet[] = machineSets.filter((ms) =>
        usesMachines.includes(ms.name)
      );
      const canRun = preferredMS.filter((ms) =>
        sortedServices.every((ser) => areServicesSchedulable(ser, ms))
      );
      if (canRun.length > 0) {
        return [true, canRun];
      } else {
        return [false, []];
      }
    }
    // Check if a dedicated MS is present
    const dedicatedMS: MachineSet[] = machineSets.filter((ms) =>
      ms.onlyFor.includes(workload.name)
    );
    if (dedicatedMS.length > 0) {
      const canRun = dedicatedMS.filter((ms) =>
        sortedServices.every((ser) => areServicesSchedulable(ser, ms))
      );
      if (canRun.length > 0) {
        return [true, canRun];
      }
    }

    // Check if any of the existing MS can
    // Exclude control plane machinesets that don't allow workload scheduling
    const canRun = machineSets.filter(
      (ms) => {
        // Skip control plane machinesets that don't allow workload scheduling
        if (ms.name === "controlPlane" || ms.name === "control-plane") {
          if (ms.allowWorkloadScheduling !== true) {
            return false;
          }
        }
        return (
          (ms.onlyFor.length === 0 || ms.onlyFor.includes(workload.name)) &&
          sortedServices.every((ser) => areServicesSchedulable(ser, ms))
        );
      }
    );
    if (canRun.length > 0) {
      return [true, canRun];
    }
    return [false, []];
  };

export const areServicesSchedulable = (
  services: Service[],
  machineSet: MachineSet
): boolean => {
  const { totalMem, totalCPU, totalDisks } =
    getTotalResourceRequirement(services);
  const kubeletCPU = getNodeKubeletCPURequirements(machineSet.cpu);
  const kubeletMemory = getNodeKubeletMemoryRequirements(machineSet.memory);

  return (
    totalMem + kubeletMemory <= machineSet.memory &&
    totalCPU + kubeletCPU <= machineSet.cpu &&
    totalDisks <= machineSet.numberOfDisks
  );
};

export const getWorkloadServices = (
  workload: Workload,
  services: Service[]
): Service[] =>
  services.filter((service) => service.id !== undefined && workload.services.includes(service.id));
