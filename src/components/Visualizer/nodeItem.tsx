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
import { Node } from "../../models/Node";
import "./nodeItem.css";

type NodeItemProps = {
  node: Node;
};

const NodeItem: React.FC<NodeItemProps> = ({ node }) => {
  const nodeLabel = node.label;
  const instanceType = node.getFittingNodeSize();
  const totalCPUs = node.cpuUnits;
  const usedCPUs = node.getUsedCPU();
  const totalMemory = node.memory;
  const usedMemory = node.getUsedMemory();
  const usedDisks = node.getAmountOfOSDs();

  return (
    <Card>
      <CardHeaderMain>
        <Title headingLevel="h1" className="card-container__title">
          {nodeLabel}
        </Title>
      </CardHeaderMain>
      <CardTitle id="instance-type">{instanceType}</CardTitle>
      <CardBody className="card-container__disk-section">
        <DatabaseIcon color="#C9190B" width="3em" height="3em" />
        <Title className="card-container-disk-section__count" headingLevel="h3">
          x {usedDisks}
        </Title>
      </CardBody>
      <div id="resource-bars">
        <CardBody>
          <CpuIcon /> CPU
          <Tooltip
            content={
              <div>
                <div>Workloads use {usedCPUs} CPU units</div>
                <div>Total {totalCPUs} CPU units</div>
              </div>
            }
          >
            <Progress
              value={(usedCPUs / totalCPUs) * 100}
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
                <div>Workloads use {usedMemory} GB</div>
                <div>Total {totalMemory} GB</div>
              </div>
            }
          >
            <Progress
              value={(usedMemory / totalMemory) * 100}
              measureLocation={ProgressMeasureLocation.none}
              aria-label="Memory"
            />
          </Tooltip>
        </CardBody>
      </div>
      <CardFooter>
        {" "}
        {totalCPUs} CPUs | {totalMemory} GB RAM
      </CardFooter>
    </Card>
  );
};

export default NodeItem;
