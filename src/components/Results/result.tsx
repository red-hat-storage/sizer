import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Button,
  List,
  ListItem,
  Title,
  TitleSizes,
} from "@patternfly/react-core";
import * as React from "react";
import Cluster from "../../models/Cluster";
import Disk from "../../models/Disk";
import { Node } from "../../models/Node";
import Service from "../../models/Service";
import {
  DeploymentDetails,
  DeploymentType,
  Platform,
  State,
} from "../../types";
import NodeVisualizer from "../Visualizer/visualizer";
import Conv from "html2canvas";
import "./result.css";

type ResultsProps = {
  state: State;
};

type SupportExceptionObject = {
  issue: string;
  header: string;
  message: string;
};

const needsSupportException: (state: State) => SupportExceptionObject = (
  state: State
) => {
  if (state.flashSize > 4) {
    const message = `Currently we only test disk sizes up to 4TB. While we do not expect any issues with larger disks, we do not currently test this and thus you will need to request a support exception.`;
    return { issue: "DiskSize", header: "Disk exceeds 4TB", message };
  }
  if ([Platform.AZURE, Platform.RHV, Platform.GCP].includes(state.platform)) {
    const message = `You selected a platform that is currently in tech-preview. While we are confident with the results of our testing so far, not all disaster scenarios have been tested and you will need to request a support exception to run on this platform in production.<br>
    We also use these support exceptions to learn about the demand for the various platforms and to priorities which platform will be fully supported next.`;
    return { issue: "Platform", header: "Platform in Tech Preview", message };
  }
  if (
    [DeploymentType.COMPACT, DeploymentType.MINIMAL].includes(
      state.deploymentType
    )
  ) {
    const message = `The deployment mode you selected is currently only available as Technology Preview. This means you need a support exception to be able to get support with this mode. <br>Chose the standard deployment mode to get the most stability and be able to scale out further.`;
    return {
      issue: "DeploymentMode",
      header: "Deployment Mode in Tech Preview",
      message,
    };
  } else return ({} as unknown) as SupportExceptionObject;
};

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

const Results: React.FC<ResultsProps> = (props) => {
  const { state } = props;
  const [
    processedValues,
    setProcessedValues,
  ] = React.useState<DeploymentDetails>({} as DeploymentDetails);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const {
    platform,
    deploymentType,
    usableCapacity,
    nodeCPU,
    nodeMemory,
    cephFSActive,
    nooBaaActive,
    rgwActive,
    nvmeTuning,
    flashSize,
  } = state;
  React.useEffect(() => {
    const temp = new Cluster(
      platform,
      deploymentType,
      new Disk(flashSize),
      usableCapacity,
      nodeCPU,
      nodeMemory,
      cephFSActive,
      nooBaaActive,
      rgwActive,
      nvmeTuning
    );
    setProcessedValues(temp.getDetails());
  }, [
    platform,
    deploymentType,
    usableCapacity,
    nodeCPU,
    nodeMemory,
    cephFSActive,
    nooBaaActive,
    rgwActive,
    nvmeTuning,
    flashSize,
  ]);

  const allNodes = processedValues?.replicaSets?.reduce(
    (acc, curr) => [...acc, ...curr.nodes],
    [] as Node[]
  );
  const screenshot = () => {
    const link = document.createElement("a");
    link.download = "OCS-Sizer.png";
    const ref = document.getElementById("nodes-vis-container");
    Conv(ref as HTMLDivElement).then((c) => {
      c.id = "download-canvas";
      c.setAttribute("style", "display: none");
      link.href = c.toDataURL();
      link.click();
    });
  };
  return (
    <div className="results-wrapper">
      <div id="support-exception">
        <SupportException state={state} />
      </div>
      <div>
        <GeneralResults {...processedValues} />
      </div>
      <div className="button-bar">
        <Button
          id="advanced-results-button"
          className="button-normalizer"
          onClick={() => setShowAdvanced((show) => !show)}
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </Button>
        <Button
          id="screenshot-download"
          className="button-normalizer"
          onClick={() => screenshot()}
        >
          Download
        </Button>
      </div>
      {showAdvanced && (
        <div>
          <AdvancedResults replicaSets={processedValues?.replicaSets} />
        </div>
      )}
      <div className="nodes-visualized" id="nodes-vis-container">
        {allNodes?.map((node, i) => (
          <NodeVisualizer node={node} key={i} />
        ))}
      </div>
    </div>
  );
};

export default Results;

const AdvancedResults: React.FC<Pick<DeploymentDetails, "replicaSets">> = (
  props
) => {
  const { replicaSets } = props;
  return (
    <div className="advanced-results left-margined">
      {replicaSets?.map((replSet, i) => (
        <div className="advanced-results__item left-margined" key={i}>
          <div>
            <Title headingLevel="h4" size="xl">
              Node Set {(i + 1).toFixed(0)}
            </Title>
          </div>
          <ReplicaSetResults nodes={replSet.nodes} />
        </div>
      ))}
    </div>
  );
};

type ReplicaSetResultsProps = {
  nodes: Node[];
};

export const ReplicaSetResults: React.FC<ReplicaSetResultsProps> = ({
  nodes,
}) => {
  return (
    <div className="node-list left-margined">
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          <div>
            <Title headingLevel="h5" size={TitleSizes.lg}>
              Node {(i + 1).toFixed(0)}
            </Title>
          </div>
          <NodeResults key={i} node={node} />
        </React.Fragment>
      ))}
    </div>
  );
};

type NodeResultsProps = {
  node: Node;
};

const NodeResults: React.FC<NodeResultsProps> = ({ node }) => {
  return (
    <div className="node-item left-margined">
      <div>
        This node has {node.getUsedCPU()} / {node.cpuUnits} used CPU units,{" "}
        {node.getUsedMemory()} / {node.memory} used GB of memory and{" "}
        {node.getAmountOfOSDs()} / {node.maxDisks} disks.
      </div>
      <div>
        Services on THIS node:
        {<ServiceResults services={node.services} />}
      </div>
    </div>
  );
};

type ServiceResultsProps = {
  services: Service[];
};
const ServiceResults: React.FC<ServiceResultsProps> = ({ services }) => (
  <List className="services left-margined">
    {services.map((service, i) => (
      <ListItem key={i}>{service.getDetails()}</ListItem>
    ))}
  </List>
);

const SupportException: React.FC<ResultsProps> = ({ state }) => {
  const { issue, header, message } = needsSupportException(state);
  const [isOpen, setOpen] = React.useState(true);

  React.useEffect(() => {
    setOpen(true);
  }, [JSON.stringify(state), setOpen]);

  return isOpen && issue !== undefined ? (
    <Alert
      isInline
      variant="warning"
      title={header}
      actionClose={<AlertActionCloseButton onClose={() => setOpen(false)} />}
      actionLinks={
        <AlertActionLink
          onClick={() =>
            window.location.assign("https://access.redhat.com/articles/5001441")
          }
        >
          Check Support Matrix
        </AlertActionLink>
      }
    >
      <div>
        <div>{message}</div>
        <div>
          This cluster is not within the regular support limits. You will need a
          support exception!
        </div>
      </div>
    </Alert>
  ) : (
    <></>
  );
};
