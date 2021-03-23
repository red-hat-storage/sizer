import {
  Progress,
  ProgressMeasureLocation,
  Tooltip,
} from "@patternfly/react-core";
import * as React from "react";
import { Node } from "../../models/Node";
import diskImage from "../../../assets/disk-icon.png";
import "./visualizer.css";

const NodeVisualizer: React.FC<{ node: Node }> = ({ node }) => {
  const nodeLabel = "Openshift node";
  const instanceType = node.getFittingNodeSize();
  const totalCPUs = node.cpuUnits;
  const ocpCPU = node.ocpCPUUnits;
  const ocsCPU = node.getUsedCPU();
  const totalMemory = node.memory;
  const ocpMemory = node.ocpMemory;
  const ocsMemory = node.getUsedMemory();
  const totalDisks = node.maxDisks;
  const usedDisks = node.getAmountOfOSDs();

  return (
    <div className="visualizer-container">
      <div className="dark-bg visualizer-title">
        <h2>{nodeLabel}</h2>
      </div>
      <div className="dark-bg visualizer-instance">
        <h2>{instanceType}</h2>
      </div>
      <div className="visualizer-body">
        <div className="visualizer-disk-wrapper">
          <img src={diskImage} className="visualizer-disk-image" />
          <h3 className="visualizer-disk-count"> x {usedDisks}</h3>
        </div>
        <div>
          <div className="visualizer-resource-progress">
            <Tooltip
              content={
                <div>
                  <div>OCP uses {ocpCPU} CPU units</div>
                  <div>OCS uses {ocsCPU} CPU units</div>
                  <div>Total {totalCPUs} CPU units</div>
                </div>
              }
            >
              <Progress
                value={((ocpCPU + ocsCPU) / totalCPUs) * 100}
                title="CPU"
                measureLocation={ProgressMeasureLocation.none}
              />
            </Tooltip>
            <Tooltip
              content={
                <div>
                  <div>OCP uses {ocpMemory} GB</div>
                  <div>OCS uses {ocsMemory} GB</div>
                  <div>Total {totalMemory} GB</div>
                </div>
              }
            >
              <Progress
                value={((ocpMemory + ocsMemory) / totalMemory) * 100}
                title="Memory"
                measureLocation={ProgressMeasureLocation.none}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeVisualizer;
