import * as React from "react";
import { List, ListItem } from "@patternfly/react-core";
import { DeploymentDetails } from "../../types";

const GeneralResults: React.FC<DeploymentDetails> = (props) => {
  const {
    ocpNodes,
    cpuUnits,
    memory,
    capacity,
    deploymentType,
    nvmeTuning,
    warningFirst,
    warningSecond,
  } = props;
  return (
    <div className="results-general" id="results">
      <div>
        The node layout diagram below shows how to reach the target capacity*
        with the constraints provided. In summary:
      </div>
      <div>
        <strong>{ocpNodes} OCP nodes</strong> will run OCS services. (NOTE: OCP
        clusters often contain additional OCP worker nodes which do not run OCS
        services.) Each OCP node running OCS services has:
        <List>
          <ListItem>{cpuUnits} CPU units</ListItem>
          <ListItem>{memory} GB memory</ListItem>
          <ListItem>The disk size is {capacity} TB</ListItem>
        </List>
      </div>
      <div>
        The OCS deployment type is <strong>{deploymentType}</strong>. OCS tuning
        for NVMe disks is{" "}
        <strong>{nvmeTuning ? "active" : "not active"}</strong>.
      </div>
      <div>
        *With this target capacity you can use up to {warningFirst?.toFixed(2)}{" "}
        TB before receiving a capactiy alert and up to{" "}
        {warningSecond?.toFixed(2)} TB before the cluster goes into read-only
        mode.
      </div>
    </div>
  );
};

export default GeneralResults;
