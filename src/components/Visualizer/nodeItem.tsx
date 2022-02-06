import * as React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeaderMain,
  CardTitle,
  Progress,
  ProgressMeasureLocation,
  Title,
} from "@patternfly/react-core";
import { DatabaseIcon, CpuIcon, MemoryIcon } from "@patternfly/react-icons";
import { Node } from "../../types";
import "./nodeItem.css";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";

type NodeItemProps = {
  node: Node;
  title: string;
};

const NodeItem: React.FC<NodeItemProps> = ({ node, title }) => {
  const services = useSelector((store: Store) => store.service.services).filter(
    (service) => node.services.includes(service.id as number)
  );
  const {
    totalMem: usedMem,
    totalCPU: usedCPU,
    totalDisks,
  } = getTotalResourceRequirement(services);
  const instanceType = node.machineSet;

  return (
    <Card>
      <CardHeaderMain>
        <Title headingLevel="h2" className="card-container__title">
          {title}
        </Title>
      </CardHeaderMain>
      <CardTitle id="instance-type">{instanceType}</CardTitle>
      <CardBody className="card-container__disk-section">
        <DatabaseIcon color="#C9190B" width="3em" height="3em" />
        <Title className="card-container-disk-section__count" headingLevel="h3">
          x {totalDisks}
        </Title>
      </CardBody>
      <div id="resource-bars">
        <CardBody>
          <CpuIcon /> CPU
          <Progress
            value={(usedCPU / node.cpuUnits) * 100}
            measureLocation={ProgressMeasureLocation.none}
            aria-label="CPU"
          />
        </CardBody>
        <CardBody>
          <MemoryIcon /> Memory{" "}
          <Progress
            value={(usedMem / node.memory) * 100}
            measureLocation={ProgressMeasureLocation.none}
            aria-label="Memory"
          />
        </CardBody>
      </div>
      <CardFooter>
        {" "}
        {node.cpuUnits} CPUs | {node.memory} GB RAM
      </CardFooter>
    </Card>
  );
};

export default NodeItem;
