import * as React from "react";
import { useDispatch } from "react-redux";
import { MachineSet } from "../../types";
import { removeMachineSet } from "../../redux";
import { Card, CardItem } from "../Generic/CardItem";
import { launchModal } from "../Modals/Modals";
import MachineSetEditModal from "./MachineSetEdit";

type MachineSetCardProps = {
  machineSet: MachineSet;
  disableActions?: boolean;
};

const MachineSetCard: React.FC<MachineSetCardProps> = ({
  machineSet,
  disableActions = false,
}) => {
  const { name, cpu, memory, instanceName, numberOfDisks, onlyFor, id } =
    machineSet;
  const dispatch = useDispatch();
  const removeMS = () => dispatch(removeMachineSet(id));
  const onEditClick = () => {
    launchModal(MachineSetEditModal, { machineSet });
  };

  return (
    <>
      <Card
        cardType="MachineSet"
        itemName={name}
        remove={removeMS}
        edit={onEditClick}
        disableActions={disableActions}
      >
        <CardItem title="CPU" value={cpu} />
        <CardItem title="Memory" value={memory} />
        <CardItem title="Instance" value={instanceName} />
        <CardItem title="Number of Disks" value={numberOfDisks} />
        {onlyFor.length > 0 && (
          <CardItem title="Only For (Workloads)" value={onlyFor.join(", ")} />
        )}
      </Card>
    </>
  );
};

export default MachineSetCard;
