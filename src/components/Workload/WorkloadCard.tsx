import * as React from "react";
import { useDispatch } from "react-redux";
import {
  Workload,
  getTotalMemory,
  getTotalCPU,
  getNamesOfServices,
} from "../../models";
import { removeWorkload } from "../../redux";
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

  return (
    <Card cardType="Workload" itemName={workload.name} remove={removeWL}>
      <CardItem title="CPU" value={`${totalCPU} units`} />
      <CardItem title="Memory Used" value={`${totalMemory} GB`} />
      <CardItem title="Services" value={services.join(", ")} />
    </Card>
  );
};

export default WorkloadCard;
