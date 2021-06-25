import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Title,
} from "@patternfly/react-core";
import {
  CloseIcon,
  CpuIcon,
  MemoryIcon,
  ServerIcon,
} from "@patternfly/react-icons";
import * as React from "react";
import { useDispatch } from "react-redux";
import { MachineSet } from "../../models";
import { removeMachineSet } from "../../redux";

type MachineSetCardProps = {
  machineSet: MachineSet;
};

const MachineSetCard: React.FC<MachineSetCardProps> = ({
  machineSet: { name, cpu, memory, nodeSize, numberOfDisks, onlyFor },
}) => {
  const dispatch = useDispatch();
  const removeMS = () => {
    dispatch(removeMachineSet(name));
  };
  return (
    <Card>
      <CardHeader>
        {name}
        <CardActions>
          <CloseIcon onClick={removeMS} />
        </CardActions>
      </CardHeader>
      <CardBody>
        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <ServerIcon />
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              <CpuIcon />: {cpu}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              <MemoryIcon />: {memory}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              NodeSize: {nodeSize}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              Number of Disks: {numberOfDisks}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              Only for:{" "}
            </Title>
            {onlyFor.map((item) => (
              <dl key={item}>item</dl>
            ))}
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default MachineSetCard;
