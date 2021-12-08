import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Workload } from "../../types";
import { openModalAction, Store } from "../../redux";
import WorkloadEditFormModal, { WORKLOAD_EDIT_MODAL_ID } from "./WorkloadEdit";
import { Card, CardItem } from "../Generic/CardItem";
import {
  getWorkloadResourceConsumption,
  removeWorkloadSafely,
} from "../../utils/workload";

type WorkloadCardProps = {
  workload: Workload;
  disableActions?: boolean;
};

const WorkloadCard: React.FC<WorkloadCardProps> = ({
  workload,
  disableActions,
}) => {
  const dispatch = useDispatch();
  const services = useSelector((store: Store) => store.service.services);
  const workloads = useSelector((store: Store) => store.workload).filter(
    (wl) => wl.duplicateOf === workload.id
  );

  const { totalMem, totalCPU } = getWorkloadResourceConsumption(
    workload,
    services
  );

  const removeWL = () => {
    const remover = removeWorkloadSafely(dispatch);
    remover(workload, services);
    workloads.forEach((wl) => remover(wl, services));
  };

  const onEditClick = () => dispatch(openModalAction(WORKLOAD_EDIT_MODAL_ID));
  const usesMachines =
    workload.usesMachines.length > 0 ? workload.usesMachines.join(",") : null;

  return (
    <>
      <WorkloadEditFormModal workload={workload} />
      <Card
        cardType="Workload"
        itemName={workload.name}
        itemId={workload.id}
        remove={removeWL}
        edit={onEditClick}
        disableActions={disableActions}
      >
        <CardItem title="Count" value={workload.count} />
        <CardItem title="CPU" value={`${totalCPU} units`} />
        <CardItem title="Memory Used" value={`${totalMem} GB`} />
        <CardItem
          title="Services"
          value={services.map((s) => s.name).join(", ")}
        />
        {usesMachines && (
          <CardItem title="Uses Machines" value={usesMachines} />
        )}
      </Card>
    </>
  );
};

export default WorkloadCard;
