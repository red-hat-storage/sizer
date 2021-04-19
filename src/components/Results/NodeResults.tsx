import { Grid, GridItem, gridSpans } from "@patternfly/react-core";
import * as React from "react";
import { Node } from "../../models/Node";
import NodeItem from "../Visualizer/nodeItem";

type NodesVisualizerProps = {
  nodes: Node[];
};

type ZonalMap = {
  [key: string]: Node[];
};

const NodesVisualResults: React.FC<NodesVisualizerProps> = ({ nodes }) => {
  /**
   * Placing nodes
   * For each node a zone is a property
   * We use the zone property to assign it to one of the columns
   * We will use Grid layout
   * Each zone has a Span of 4
   */
  const zones = nodes?.map((node) => node.zone);

  /**
   * zonalMap = {
   *    'zoneA' : [nodeItem, nodeItem ....]
   * }
   */
  const zonalMap: ZonalMap = zones?.reduce((acc, curr) => {
    const nodesInCurrZone = nodes.filter((node) => node?.zone === curr);
    acc[curr] = nodesInCurrZone;
    return acc;
  }, {} as ZonalMap);

  const span = 12 / (zones?.length ?? 1);

  return zones?.length > 0 ? (
    <Grid hasGutter>
      {Object.entries(zonalMap).map(([, v], zoneCount) =>
        v.map((node, i) => (
          <GridItem key={`${i}`} offset={(span * zoneCount) as gridSpans}>
            <NodeItem key={`node-${zoneCount}-${i}`} node={node} />
          </GridItem>
        ))
      )}
    </Grid>
  ) : null;
};

export default NodesVisualResults;
