import * as React from "react";
import { List, ListItem, Title, TitleSizes } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import { Node } from "../../types";
import { getTotalResourceRequirement } from "../../utils/common";
import { Service } from "../../models";

type ServiceResultsProps = {
  services: Service[];
};
const ServiceResults: React.FC<ServiceResultsProps> = ({ services }) => (
  <List className="services left-margined">
    {services.map((service) => (
      <ListItem key={service.id}>{service.name}</ListItem>
    ))}
  </List>
);

type NodeResultsProps = {
  node: Node;
};

const NodeResults: React.FC<NodeResultsProps> = ({ node }) => {
  const services = useSelector((store: Store) => store.service.services).filter(
    (service) => node.services.includes(service.id as number)
  );
  const { totalMem, totalCPU, totalDisks } =
    getTotalResourceRequirement(services);
  return (
    <div className="node-item left-margined">
      <div>
        This node has {totalCPU} / {node.cpuUnits} used CPU units, {totalMem} /{" "}
        {node.memory} used GB of memory and {totalDisks} / {node.maxDisks}{" "}
        disks.
      </div>
      <div>
        Services on THIS node:
        {<ServiceResults services={services} />}
      </div>
    </div>
  );
};

type ReplicaSetResultsProps = {
  nodes: number[];
};

export const ReplicaSetResults: React.FC<ReplicaSetResultsProps> = ({
  nodes,
}) => {
  const nodeObjects = useSelector((store: Store) => store.node.nodes).filter(
    (node) => nodes.includes(node.id)
  );
  return (
    <div className="node-list left-margined">
      {nodeObjects.map((node, i) => (
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
