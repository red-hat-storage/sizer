import * as React from "react";
import * as _ from "lodash";
import { List, ListItem } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { getTotalResourceRequirement } from "../../utils/common";

const GeneralResults: React.FC = () => {
  const { nodes, services, workload } = useSelector((store: Store) => ({
    nodes: store.node.nodes,
    services: store.service.services,
    workload: store.workload.find((wl) => wl.name === "ODF"),
  }));

  const odfServices = workload
    ? services.filter((service) => workload.services.includes(service.id))
    : [];
  const odfServiceIDs = workload
    ? odfServices.map((service) => service.id)
    : [];

  const odfNodes = workload
    ? nodes.filter(
        (node) => _.intersection(node.services, odfServiceIDs).length > 0
      )
    : [];
  const { totalCPU, totalMem, totalDisks } = getTotalResourceRequirement(
    odfServices
  );
  return (
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
