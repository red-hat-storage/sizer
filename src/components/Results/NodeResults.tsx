import * as React from "react";
import { Flex, Title } from "@patternfly/react-core";
import { Node, Zone } from "../../types";
import NodeItem from "../Visualizer/nodeItem";
import { useSelector } from "react-redux";
import { Store } from "../../redux";

type NodesVisualizerProps = {
  nodes: Node[];
};

const NodesVisualResults: React.FC<NodesVisualizerProps> = ({ nodes }) => {
  const zones: Zone[] = useSelector((store: Store) => store.zone.zones);
  const zoneNodeMap = zones.reduce((acc, curr) => {
    acc[curr.id] = nodes.filter((node) => curr.nodes.includes(node.id));
    return acc;
  }, {} as { [key: number]: Node[] });
  return nodes?.length > 0 ? (
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      flexWrap={{ default: "nowrap" }}
      className="nodeResult-item--overflow"
    >
      {Object.entries(zoneNodeMap).map(([, v], i) => {
        return (
          <Flex direction={{ default: "column" }}>
            <Flex alignSelf={{ default: "alignSelfCenter" }}>
              <Title headingLevel="h4" size="xl">
                Zone-{i + 1}
              </Title>
            </Flex>
            {v.map((node, index) => (
              <Flex direction={{ default: "column" }}>
                <NodeItem key={`node-${index}`} node={node} />
              </Flex>
            ))}
          </Flex>
        );
      })}
    </Flex>
  ) : null;
};

export default NodesVisualResults;
