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
  const nodeLabel = "Openshift node";
  const instanceType = node.getFittingNodeSize();
  const totalCPUs = node.cpuUnits;
  const ocpCPU = node.ocpCPUUnits;
  const ocsCPU = node.getUsedCPU();
  const totalMemory = node.memory;
  const ocpMemory = node.ocpMemory;
  const ocsMemory = node.getUsedMemory();
  const usedDisks = node.getAmountOfOSDs();

  return (
    <Card>
      <CardHeaderMain>
        <Title headingLevel="h1" className="card-container__title">
          {nodeLabel}
        </Title>
      </CardHeaderMain>
      <CardTitle>{instanceType}</CardTitle>
      <CardBody className="card-container__disk-section">
        <DatabaseIcon color="#C9190B" width="3em" height="3em" />
        <Title className="card-container-disk-section__count" headingLevel="h3">
          x {usedDisks}
        </Title>
      </CardBody>
      <CardBody>
        <CpuIcon /> CPU
        <Tooltip
          content={
            <div>
              <div>OCP uses {ocpCPU} CPU units</div>
              <div>ODF uses {ocsCPU} CPU units</div>
              <div>Total {totalCPUs} CPU units</div>
            </div>
          }
        >
          <Progress
            value={((ocpCPU + ocsCPU) / totalCPUs) * 100}
            measureLocation={ProgressMeasureLocation.none}
          />
        </Tooltip>
      </CardBody>
      <CardBody>
        <MemoryIcon /> Memory{" "}
        <Tooltip
          content={
            <div>
              <div>OCP uses {ocpMemory} GB</div>
              <div>ODF uses {ocsMemory} GB</div>
              <div>Total {totalMemory} GB</div>
            </div>
          }
        >
          <Progress
            value={((ocpMemory + ocsMemory) / totalMemory) * 100}
            measureLocation={ProgressMeasureLocation.none}
          />
        </Tooltip>
      </CardBody>
      <CardFooter> 16 CPUs | 128 GB RAM</CardFooter>
    </Card>
  );
};

export default NodeItem;
