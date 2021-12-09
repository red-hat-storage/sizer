import * as React from "react";
import { ChartDonut } from "@patternfly/react-charts";

type CapacityChartProps = {
  description: string;
  title: string;
  usedCapacity: number;
  totalCapacity: number;
};

const CapacityChart: React.FC<CapacityChartProps> = ({
  description,
  usedCapacity,
  totalCapacity,
}) => {
  const usedPercentage = (usedCapacity / totalCapacity) * 100;
  const availablePercentage = 100 - usedPercentage;

  return (
    <div style={{ height: "200px", width: "350px" }}>
      <ChartDonut
        ariaDesc={description}
        constrainToVisibleArea={true}
        data={[
          { x: "Used Capacity", y: usedPercentage },
          { x: "Avaiable Capacity", y: availablePercentage },
        ]}
        legendData={[
          { name: `Used Capacity: ${usedCapacity} TiB` },
          { name: `Total Capacity: ${totalCapacity} TiB` },
        ]}
        legendPosition="right"
        legendOrientation="vertical"
        subTitle="ODF Capacity Consumption"
        subTitlePosition="bottom"
        height={200}
        labels={({ datum }) => `${datum.x}: ${datum.y}%`}
        title={`${usedPercentage} % used`}
        width={300}
        padding={{
          bottom: 30,
          left: 5,
          right: 150,
          top: 5,
        }}
      />
    </div>
  );
};

export default CapacityChart;
