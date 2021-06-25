import {
  Card,
  CardHeader,
  CardActions,
  CardBody,
  Flex,
  FlexItem,
  Title,
} from "@patternfly/react-core";
import {
  CloseIcon,
  CpuIcon,
  MemoryIcon,
  ClusterIcon,
} from "@patternfly/react-icons";
import * as React from "react";
import { useDispatch } from "react-redux";
import {
  Workload,
  getTotalMemory,
  getTotalCPU,
  getNamesOfServices,
} from "../../models";
import { removeWorkload } from "../../redux";

type WorkloadCardProps = {
  workload: Workload;
};

const WorkloadCard: React.FC<WorkloadCardProps> = ({ workload }) => {
  const dispatch = useDispatch();

  const totalMemory = getTotalMemory(workload);
  const totalCPU = getTotalCPU(workload);
  const services = getNamesOfServices(workload);

  const removeWL = () => {
    dispatch(removeWorkload(workload.name));
  };
  return (
    <Card>
      <CardHeader>
        {workload.name}
        <CardActions>
          <CloseIcon onClick={removeWL} />
        </CardActions>
      </CardHeader>
      <CardBody>
        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <ClusterIcon />
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              <CpuIcon />: {totalCPU}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              <MemoryIcon />: {totalMemory}
            </Title>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h6" size="md">
              Services: {services.join(", ")}
            </Title>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default WorkloadCard;
