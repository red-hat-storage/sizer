import * as React from "react";
import { List, ListItem } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";

const GeneralResults: React.FC = () => {
  const { nodes, services } = useSelector((store: Store) => ({
    nodes: store.node.nodes,
    services: store.service.services,
  }));
  const { totalCPU, totalMem, totalDisks } =
    getTotalResourceRequirement(services);
  return (
    <div className="results-general" id="results">
      <div>
        The node layout diagram below shows how to reach the target capacity*
        with the constraints provided. <br />
        In summary:
      </div>
      <div>
        <strong>{nodes.length} OCP nodes</strong> will run ODF services. (NOTE:
        OCP clusters often contain additional OCP worker nodes which do not run
        ODF services.) <br />
        Total ODF resource consumption is:
        <List>
          <ListItem>{totalCPU} CPU units</ListItem>
          <ListItem>{totalMem} GB memory</ListItem>
          <ListItem>The disk size is {totalDisks} TB</ListItem>
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
  );
};

export default GeneralResults;
