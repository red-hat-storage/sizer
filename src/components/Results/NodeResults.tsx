import * as React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { Node } from "../../types";
import NodeItem from "../Visualizer/nodeItem";

type NodesVisualizerProps = {
  nodes: Node[];
};

const NodesVisualResults: React.FC<NodesVisualizerProps> = ({ nodes }) => {
  return nodes?.length > 0 ? (
    <Grid hasGutter>
      {nodes.map((node, i) => (
        <GridItem key={`${i}`} sm={12} md={4} lg={4} xl={4} xl2={4}>
          <NodeItem key={`node-${i}`} node={node} />
        </GridItem>
      ))}
    </Grid>
  ) : null;
};

export default NodesVisualResults;
