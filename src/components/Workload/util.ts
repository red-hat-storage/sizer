import * as _ from "lodash";
import { Workload } from "../../models";

const workloadKeys = ["name", "count", "usesMachines", "services"];

export const isValidWorkload = (workload: Workload): boolean => {
  const candidateKeys = Object.keys(workload || {});
  return (
    _.intersection(workloadKeys, candidateKeys).length === workloadKeys.length
  );
};
