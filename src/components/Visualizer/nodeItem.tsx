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
  Tooltip,
} from "@patternfly/react-core";
import { DatabaseIcon, CpuIcon, MemoryIcon } from "@patternfly/react-icons";
import { Node } from "../../types";
import "./nodeItem.css";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";

type NodeItemProps = {
  node: Node;
};

const NodeItem: React.FC<NodeItemProps> = ({ node }) => {
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
        <Title headingLevel="h1" className="card-container__title">
          TBD
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
          <Tooltip
            content={
              <div>
                <div>Workloads use {usedCPU} CPU units</div>
                <div>Total {node.cpuUnits} CPU units</div>
              </div>
            }
          >
            <Progress
              value={(usedCPU / node.cpuUnits) * 100}
              measureLocation={ProgressMeasureLocation.none}
              aria-label="CPU"
            />
          </Tooltip>
        </CardBody>
        <CardBody>
          <MemoryIcon /> Memory{" "}
          <Tooltip
            content={
              <div>
                <div>Workloads use {usedMem} GB</div>
                <div>Total {node.memory} GB</div>
              </div>
            }
          >
            <Progress
              value={(usedMem / node.memory) * 100}
              measureLocation={ProgressMeasureLocation.none}
              aria-label="Memory"
            />
          </Tooltip>
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
