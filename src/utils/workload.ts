import { Dispatch } from "@reduxjs/toolkit";
import * as _ from "lodash";
import {
  MachineSet,
  Service,
  ServiceDescriptor,
  Workload,
  WorkloadDescriptor,
} from "../types";
import {
  generateWorkloadID,
  removeServicesFromNodes,
  removeWorkload,
} from "../redux";
import { generateServiceID, removeServices } from "../redux/reducers/service";
import { getTotalResourceRequirement } from "./common";
import { getAllCoplacedServices, sortServices } from "./service";

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
  const serviceObjects: Service[] = serviceDescriptors.reduce(
    (acc, curr, index) => {
      const serviceObject: Partial<Service> = _.omit(curr, [
        "avoid",
        "runsWith",
      ]);
      if (!serviceDescriptors) {
        console.log(serviceDescriptors);
      }
      serviceObject.avoid = curr.avoid.map(
        (item) => serviceDescriptors.find((so) => so.name === item).id
      );
      serviceObject.runsWith = curr.runsWith.map(
        (item) => serviceDescriptors.find((so) => so.name === item).id
      );
      acc[index] = serviceObject;
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
    workload.services.includes(service.id)
  );
  const serviceDescriptors: ServiceDescriptor[] = usedServices.map((s) => {
    return Object.assign({}, s, {
      runsWith: s.runsWith.map(
        (r) => services.find((serv) => serv.id === r).name
      ),
      avoid: s.avoid.map((r) => services.find((serv) => serv.id === r).name),
    });
  });
  const workloadDescriptor: WorkloadDescriptor = Object.assign({}, workload, {
    services: serviceDescriptors,
  });
  return workloadDescriptor;
};

export const getMachineSetForWorkload = (
  workload: Workload,
  machineSets: MachineSet[]
): MachineSet => {
  const dedicatedMS = machineSets.find((ms) =>
    ms.onlyFor.includes(workload.name)
  );
  if (dedicatedMS) {
    return dedicatedMS;
  }
  if (workload.usesMachines.length > 0) {
    return machineSets.find((ms) =>
      workload.usesMachines.includes(ms.name)
    ) as MachineSet;
  }
  return machineSets[0];
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

export const removeWorkloadSafely =
  (dispatch: Dispatch) =>
  (workload: Workload, services: Service[]): void => {
    const terminatedServices = services.filter((service) =>
      workload.services.includes(service.id as number)
    );
    dispatch(removeServicesFromNodes(terminatedServices));
    dispatch(removeServices(terminatedServices));
    dispatch(removeWorkload(workload));
  };

export const isWorkloadSchedulable =
  (services: Service[], machineSets: MachineSet[]) =>
  (workload: Workload): [boolean, MachineSet[]] => {
    // First check if the workload uses some machine
    const serviceObjects: Service[] = services.filter((service) =>
      workload.services.includes(service.id)
    );
    const coplacedServices = getAllCoplacedServices(serviceObjects);
    const sortedServices = coplacedServices.sort(sortServices);
    const { usesMachines } = workload;
    if (usesMachines.length > 0) {
      const preferredMS: MachineSet[] = machineSets.filter((ms) =>
        usesMachines.includes(ms.name)
      );
      const canRun = preferredMS.filter((ms) =>
        areServicesSchedulable(sortedServices[0], ms)
      );
      if (canRun.length > 0) {
        return [true, canRun];
      }
    }
    // Check if a dedicated MS is present
    const dedicatedMS: MachineSet[] = machineSets.filter((ms) =>
      ms.onlyFor.includes(workload.name)
    );
    if (dedicatedMS.length > 0) {
      const canRun = dedicatedMS.filter((ms) =>
        areServicesSchedulable(sortedServices[0], ms)
      );
      if (canRun.length > 0) {
        return [true, canRun];
      }
    }

    // Check if any of the existing MS can
    const canRun = machineSets.filter(
      (ms) =>
        (ms.onlyFor.length === 0 || ms.onlyFor.includes(workload.name)) &&
        areServicesSchedulable(sortedServices[0], ms)
    );
    if (canRun.length > 0) {
      return [true, canRun];
    }
    return [false, null];
  };

export const areServicesSchedulable = (
  services: Service[],
  machineSet: MachineSet
): boolean => {
  const { totalMem, totalCPU } = getTotalResourceRequirement(services);
  return totalMem <= machineSet.memory && totalCPU <= machineSet.cpu;
};

export const getWorkloadServices = (
  workload: Workload,
  services: Service[]
): Service[] =>
  services.filter((service) => workload.services.includes(service.id));
