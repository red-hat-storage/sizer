import { Grid, GridItem, gridSpans } from "@patternfly/react-core";
import * as React from "react";
import { Node } from "../../models/Node";
import NodeItem from "../Visualizer/nodeItem";

type NodesVisualizerProps = {
  nodes: Node[];
};

const NodesVisualResults: React.FC<NodesVisualizerProps> = ({ nodes }) => {
  return nodes?.length > 0 ? (
    <Grid hasGutter>
      {nodes.map((node, i) => (
        <GridItem key={`${i}`} sm={12} span={4}>
          <NodeItem key={`node-${i}`} node={node} />
        </GridItem>
      ))}
    </Grid>
  ) : null;
};

export default NodesVisualResults;
