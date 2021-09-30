import * as React from "react";
import { useDispatch } from "react-redux";
import {
  Workload,
  getTotalMemory,
  getTotalCPU,
  getNamesOfServices,
} from "../../models";
import { removeWorkload, openModalAction } from "../../redux";
import WorkloadEditFormModal, { WORKLOAD_EDIT_MODAL_ID } from "./WorkloadEdit";
import { Card, CardItem } from "../Generic/CardItem";

type WorkloadCardProps = {
  workload: Workload;
};

const WorkloadCard: React.FC<WorkloadCardProps> = ({ workload }) => {
  const dispatch = useDispatch();

  const totalMemory = getTotalMemory(workload);
  const totalCPU = getTotalCPU(workload);
  const services = getNamesOfServices(workload);

  const removeWL = (name: string) => () => dispatch(removeWorkload(name));
  const onEditClick = () => dispatch(openModalAction(WORKLOAD_EDIT_MODAL_ID));
  const usesMachines =
    workload.usesMachines.length > 0 ? workload.usesMachines.join(",") : null;

  return (
    <>
      <WorkloadEditFormModal workload={workload} />
      <Card
        cardType="Workload"
        itemName={workload.name}
        itemId={workload.uid}
        remove={removeWL}
        edit={onEditClick}
      >
        <CardItem title="Count" value={workload.count} />
        <CardItem title="CPU" value={`${totalCPU} units`} />
        <CardItem title="Memory Used" value={`${totalMemory} GB`} />
        <CardItem title="Services" value={services.join(", ")} />
        {usesMachines && (
          <CardItem title="Uses Machines" value={usesMachines} />
        )}
      </Card>
    </>
  );
};

export default WorkloadCard;
