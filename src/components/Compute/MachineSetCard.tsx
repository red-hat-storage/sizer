import * as React from "react";
import { useDispatch } from "react-redux";
import { MachineSet } from "../../types";
import { openModalAction, removeMachineSet } from "../../redux";
import { Card, CardItem } from "../Generic/CardItem";
import MachineSetEditModal, { MACHINESET_EDIT_MODAL } from "./MachineSetEdit";

type MachineSetCardProps = {
  machineSet: MachineSet;
  disableActions?: boolean;
};

const MachineSetCard: React.FC<MachineSetCardProps> = ({
  machineSet,
  disableActions = false,
}) => {
  const {
    name,
    cpu,
    memory,
    instanceName,
    numberOfDisks,
    onlyFor,
  } = machineSet;
  const dispatch = useDispatch();
  const removeMS = () => dispatch(removeMachineSet(name));
  const onEditClick = () => dispatch(openModalAction(MACHINESET_EDIT_MODAL));
  return (
    <>
      <MachineSetEditModal machineSet={machineSet} />
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
