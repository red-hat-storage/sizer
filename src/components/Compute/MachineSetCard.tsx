import * as React from "react";
import { useDispatch } from "react-redux";
import { MachineSet } from "../../models";
import { removeMachineSet } from "../../redux";
import { Card, CardItem } from "../Generic/CardItem";

type MachineSetCardProps = {
  machineSet: MachineSet;
  disableDeletion?: boolean;
};

const MachineSetCard: React.FC<MachineSetCardProps> = ({
  machineSet: { name, cpu, memory, instanceName, numberOfDisks, onlyFor },
  disableDeletion = false,
}) => {
  const dispatch = useDispatch();
  const removeMS = () => dispatch(removeMachineSet(name));
  return (
    <Card
      cardType="MachineSet"
      itemName={name}
      remove={removeMS}
      disableDeletion={disableDeletion}
    >
      <CardItem title="CPU" value={cpu} />
      <CardItem title="Memory" value={memory} />
      <CardItem title="Instance" value={instanceName} />
      <CardItem title="Number of Disks" value={numberOfDisks} />
      {onlyFor.length > 0 && (
        <CardItem title="Only For (Workloads)" value={onlyFor.join(", ")} />
      )}
    </Card>
  );
};

export default MachineSetCard;
