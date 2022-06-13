import { useDispatch, useSelector } from "react-redux";
import { Store } from "../../redux";
import { Workload } from "../../types";
import { removeWorkloadSafely } from "../../utils/workload";
import { Alert, AlertActionLink } from "@patternfly/react-core";
import * as React from "react";
import "./workloadSchedulerAlerts.css";

type UnschedulableWorkloadProps = {
  workload: Workload;
};
const UnschedulableWorkload: React.FC<UnschedulableWorkloadProps> = ({
  workload,
}) => {
  const dispatch = useDispatch();
  const { services } = useSelector((store: Store) => ({
    services: store.service.services,
  }));
  const removeWorkload = () => {
    removeWorkloadSafely(dispatch)(workload, services);
  };
  return (
    <Alert
      className="results-page__unschedulable-alert--padding"
      isInline
      variant="danger"
      title={`${workload.name} is not schedulable`}
      actionLinks={
        <>
          <AlertActionLink onClick={removeWorkload}>
            Remove Workload
          </AlertActionLink>
        </>
      }
    >
      Workload {workload.name} is not schedulable.
      {workload.usesMachines.length > 0 ? (
        <>
          {workload.usesMachines.join(", ")}{" "}
          {workload.usesMachines.length > 1 ? "MachineSets" : "MachineSet"} are
          not large enough.
        </>
      ) : (
        <> All available MachineSets are too small to run this workload.</>
      )}
    </Alert>
  );
};

export default UnschedulableWorkload;
