import * as React from "react";
import * as _ from "lodash";
import { useSelector } from "react-redux";
import { platformInstanceMap } from "../../cloudInstance";
import { Instance } from "../../types";
import { Store } from "../../redux";
import { FormGroup } from "@patternfly/react-core";
import Slider from "@mui/material/Slider";
import { getReadableMemory } from "../../utils";
import "./instanceFilter.css";

type InstanceFilterProps = {
  cpu: [number, number];
  setCPU: any;
  memory: [number, number];
  setMemory: any;
};

const InstanceFilter: React.FC<InstanceFilterProps> = ({
  cpu,
  setCPU,
  memory,
  setMemory,
}) => {
  const platform = useSelector((store: Store) => store.cluster.platform);

  const [memoryPoints, cpuPoints] = React.useMemo(() => {
    const instanceMap: Instance[] = platformInstanceMap[platform];
    const memoryUnits = instanceMap.map((item) => item.memory);
    const cpuUnits = instanceMap.map((item) => item.cpuUnits);
    return [_.uniq(memoryUnits), _.uniq(cpuUnits)];
  }, [platform]);

  const minMemory: number = _.min(memoryPoints) / 1024;
  const maxCPU: number = _.max(cpuPoints);
  const minCPU: number = _.min(cpuPoints);

  const maxMemory = Math.log2(_.max(memoryPoints));

  const handleCPUChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    const minDistance = 5;
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxCPU - minDistance);
        setCPU([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setCPU([clamped - minDistance, clamped]);
      }
    } else {
      setCPU(newValue as number[]);
    }
  };

  const handleMemoryChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    const minDistance = 1;
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxMemory - minDistance);
        setMemory([2 ** clamped, 2 ** (clamped + minDistance)]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setMemory([2 ** (clamped - minDistance), 2 ** clamped]);
      }
    } else {
      setMemory([2 ** newValue[0], 2 ** newValue[1]]);
    }
  };

  return (
    <>
      <FormGroup label="CPU Filter" fieldId="cpu">
        <Slider
          classes={{ root: "slider-padding" }}
          id="cpu"
          value={cpu}
          onChange={handleCPUChange}
          valueLabelDisplay="on"
          disableSwap
          min={minCPU}
          max={maxCPU}
        />
      </FormGroup>
      <FormGroup label="Memory Filter" fieldId="memory">
        <Slider
          classes={{ root: "slider-padding" }}
          id="memory"
          value={[Math.log2(memory[0]), Math.log2(memory[1])]}
          onChange={handleMemoryChange}
          valueLabelDisplay="on"
          disableSwap
          min={minMemory}
          max={maxMemory}
          valueLabelFormat={getReadableMemory}
          scale={(x) => 2 ** x}
        />
      </FormGroup>
    </>
  );
};

type UseInstanceFilter = () => [
  React.ReactElement,
  number,
  number,
  number,
  number
];

const useInstanceFilter: UseInstanceFilter = () => {
  const [cpu, setCPU] = React.useState<[number, number]>([0, 100]);
  const [memory, setMemory] = React.useState<[number, number]>([0, 500]);

  const FilterComponent = (
    <InstanceFilter
      cpu={cpu}
      setCPU={setCPU}
      memory={memory}
      setMemory={setMemory}
    />
  );

  return [FilterComponent, cpu[0], cpu[1], memory[0], memory[1]];
};

export default useInstanceFilter;
