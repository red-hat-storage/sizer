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

export const createDuplicates = (
  workload: WorkloadDescriptor,
  duplicateOwner: number
): WorkloadDescriptor[] => {
  const workloads = [];
  _.times(workload.count - 1, (count) => {
    const newObject = Object.assign({}, workload, {
      name: `${workload.name}-${count + 1}`,
      duplicateOf: duplicateOwner,
    });
    newObject.services = newObject.services.map((service) =>
      Object.assign(
        {},
        service,
        { name: `${service.name}-${count + 1}` },
        {
          runsWith: service.runsWith.map((s) => `${s}-${count + 1}`),
          avoid: service.avoid.map((s) => `${s}-${count + 1}`),
        }
      )
    );
    workloads.push(newObject);
  });
  return workloads;
};
