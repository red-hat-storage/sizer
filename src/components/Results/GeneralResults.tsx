import * as React from "react";
import * as _ from "lodash";
import { List, ListItem } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";
import CapacityChart from "../Generic/Capacity";
import { ODF_WORKLOAD_NAME } from "../../constants";

type GeneralResultsProps = {
  isODFPresent: boolean;
};

const GeneralResults: React.FC<GeneralResultsProps> = ({ isODFPresent }) => {
  const {
    nodes,
    services,
    workload,
    diskSize,
    totalCapacity: totalCapacityInTB,
  } = useSelector((store: Store) => ({
    nodes: store.node.nodes,
    services: store.service.services,
    workload: store.workload,
    diskSize: store.ocs.flashSize,
    totalCapacity: store.ocs.usableCapacity,
  }));

  const totalStorageRequiredInGB = workload.reduce((acc, curr) => {
    acc += curr.storageCapacityRequired || 0;
    return acc;
  }, 0);

  const odfWorkload = isODFPresent
    ? workload.find((wl) => wl.name === ODF_WORKLOAD_NAME)
    : null;

  const odfServices = isODFPresent
    ? services.filter((service) => odfWorkload.services.includes(service.id))
    : [];
  const odfServiceIDs = isODFPresent
    ? odfServices.map((service) => service.id)
    : [];

  const odfNodes = isODFPresent
    ? nodes.filter(
        (node) => _.intersection(node.services, odfServiceIDs).length > 0
      )
    : [];
  const { totalCPU, totalMem } = getTotalResourceRequirement(services, true);
  return (
    <div>
      <div className="results-general" id="results">
        <div>
          The node layout diagram below shows how to reach the target capacity
          of {totalCapacityInTB} TB* with the constraints provided. <br />
          In summary:
        </div>
        <div>
          <div>
            <strong>{nodes.length} OCP nodes</strong> are needed to run all
            Workloads.
          </div>
          <div>
            {odfNodes.length} of these nodes participate in the ODF cluster.
          </div>
          Total cluster resource consumption is:
          <List>
            <ListItem>
              <strong>{totalCPU.toFixed(2)} CPU units</strong>
            </ListItem>
            <ListItem>
              <strong>{totalMem.toFixed(2)} GB memory</strong>
            </ListItem>
            <ListItem>The ODF disk size is {diskSize.toFixed(2)} TB</ListItem>
          </List>
        </div>
        {
          /* <div>
        The ODF deployment type is <strong>{deploymentType}</strong>. ODF tuning
        for NVMe disks is{" "}
        <strong>{nvmeTuning ? "active" : "not active"}</strong>.
      </div> */
          <div>
            *With this target capacity you can use up to{" "}
            {(totalCapacityInTB * 0.75).toFixed(2)} TB before receiving a
            capactiy alert and up to {(totalCapacityInTB * 0.85).toFixed(2)} TB
            before the cluster goes into read-only mode.
          </div>
        }
      </div>
      {isODFPresent && (
        <div>
          <CapacityChart
            title="ODF usage"
            usedCapacity={Math.round(totalStorageRequiredInGB / 100) / 10}
            totalCapacity={totalCapacityInTB}
            description="Shows the ODF Cluster Usage"
          />
        </div>
      )}
    </div>
  );
};

export default GeneralResults;
