import { Dispatch } from "@reduxjs/toolkit";
import { MS_DEFAULT_NAME } from "../constants";
import { MachineSet, Service, Workload, WorkloadDescriptor } from "../models";
import { removeServicesFromNodes, removeWorkload } from "../redux";
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
  const serviceObjects: Service[] = services.map((service) =>
    Object.assign({}, service, { id: generateServiceID() })
  );
  const serviceIDs: number[] = serviceObjects.map(
    (service) => service.id as number
  );
  const updatedWorkload: Workload = Object.assign({}, workload, {
    services: serviceIDs,
  });
  return { services: serviceObjects, workload: updatedWorkload };
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
  return machineSets.find((ms) => ms.name === MS_DEFAULT_NAME) as MachineSet;
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
  (workload: Workload): boolean => {
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
      const canRun: boolean = preferredMS.some((ms) =>
        areServicesSchedulable(sortedServices[0], ms)
      );
      if (canRun) {
        return true;
      }
      return false;
    }
    // Check if a dedicated MS is present
    const dedicatedMS: MachineSet[] = machineSets.filter((ms) =>
      ms.onlyFor.includes(workload.name)
    );
    if (dedicatedMS.length > 0) {
      const canRun: boolean = dedicatedMS.some((ms) =>
        areServicesSchedulable(sortedServices[0], ms)
      );
      if (canRun) {
        return true;
      }
    }

    // Check if any of the existing MS can
    const canRun: boolean = machineSets.some((ms) =>
      areServicesSchedulable(sortedServices[0], ms)
    );
    if (canRun) {
      return true;
    }
    return false;
  };

export const areServicesSchedulable = (
  services: Service[],
  machineSet: MachineSet
): boolean => {
  const { totalMem, totalCPU } = getTotalResourceRequirement(services);
  return totalMem <= machineSet.memory && totalCPU <= machineSet.cpu;
};
