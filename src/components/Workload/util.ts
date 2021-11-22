/* eslint-disable @typescript-eslint/ban-types */
import * as _ from "lodash";
import { WorkloadDescriptor } from "../../models";

const workloadKeys = ["name", "count", "usesMachines", "services"];

export const isValidWorkload = (workload: WorkloadDescriptor): boolean => {
  const candidateKeys = Object.keys(workload || {});
  return (
    _.intersection(workloadKeys, candidateKeys).length === workloadKeys.length
  );
};

export const applyModifier = (
  workload: WorkloadDescriptor,
  modifier: Partial<WorkloadDescriptor>
): WorkloadDescriptor => {
  const newWorkload = _.cloneDeep(workload);
  const simpleOverrides = _.omit(modifier, ["usesMachines", "services"]);
  Object.assign(newWorkload, simpleOverrides);
  // Override services
  const currentServices = newWorkload.services;
  const newServices = modifier.services || [];
  const updatedServices = currentServices.map((service) => {
    const serviceFound = newServices.find((s) => s.name === service.name);
    if (serviceFound) {
      return Object.assign(service, serviceFound);
    } else return service;
  });
  const addedServices = newServices.filter(
    (s) => currentServices.find((cs) => cs.name === s.name) === undefined
  );
  newWorkload.services = [...updatedServices, ...addedServices];
  // Override machines
  const newMachines = modifier.usesMachines || [];
  newWorkload.usesMachines = _.uniq([
    ...newWorkload.usesMachines,
    ...newMachines,
  ]);
  return newWorkload;
};
