import * as React from "react";
import * as _ from "lodash";
import { List, ListItem } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";
import CapacityChart from "../Generic/Capacity";

type GeneralResultsProps = {
  isODFPresent: boolean;
};

const GeneralResults: React.FC<GeneralResultsProps> = ({ isODFPresent }) => {
  const { nodes, services, workload, diskSize, totalCapacity } = useSelector(
    (store: Store) => ({
      nodes: store.node.nodes,
      services: store.service.services,
      workload: store.workload,
      diskSize: store.ocs.flashSize,
      totalCapacity: store.ocs.usableCapacity,
    })
  );

  const totalStorageUsage = workload.reduce((acc, curr) => {
    acc += curr.storageCapacityRequired || 0;
    return acc;
  }, 0);

  const odfWorkload = isODFPresent
    ? workload.find((wl) => wl.name === "ODF")
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
  const { totalCPU, totalMem } = getTotalResourceRequirement(odfServices);
  return (
    <div>
      <div className="results-general" id="results">
        <div>
          The node layout diagram below shows how to reach the target capacity*
          with the constraints provided. <br />
          In summary:
        </div>
        <div>
          <div>
            <strong>{odfNodes.length} OCP nodes</strong> will run ODF services.
          </div>
          Total ODF resource consumption is:
          <List>
            <ListItem>{totalCPU} CPU units</ListItem>
            <ListItem>{totalMem} GB memory</ListItem>
            <ListItem>The disk size is {diskSize} TB</ListItem>
          </List>
        </div>
        {/* <div>
        The ODF deployment type is <strong>{deploymentType}</strong>. ODF tuning
        for NVMe disks is{" "}
        <strong>{nvmeTuning ? "active" : "not active"}</strong>.
      </div>
      <div>
        *With this target capacity you can use up to {warningFirst?.toFixed(2)}{" "}
        TB before receiving a capactiy alert and up to{" "}
        {warningSecond?.toFixed(2)} TB before the cluster goes into read-only
        mode.
      </div> */}
      </div>
      {isODFPresent && (
        <div>
          <CapacityChart
            title="ODF usage"
            usedCapacity={totalStorageUsage}
            totalCapacity={totalCapacity}
            description="Shows the ODF Cluster Usage"
          />
        </div>
      )}
    </div>
  );
};

export default GeneralResults;
