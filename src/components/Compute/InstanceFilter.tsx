import * as React from "react";
import * as _ from "lodash";
import { useSelector } from "react-redux";
import { platformInstanceMap } from "../../cloudInstance";
import { Instance } from "../../types";
import { Store } from "../../redux";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import CaretDownIcon from "@patternfly/react-icons/dist/esm/icons/caret-down-icon";

type InstanceFilterProps = {
  setMaxCPU: any;
  maxCPU: number;
  minCPU: number;
  setMinCPU: any;
  minMem: number;
  setMinMem: any;
  maxMem: number;
  setMaxMem: any;
};

enum DropdownID {
  MIN_CPU = "MIN_CPU",
  MAX_CPU = "MAX_CPU",
  MIN_MEM = "MIN_MEM",
  MAX_MEM = "MAX_MEM",
}

const dropdownItemGenerator = (comparator, filter, items) => {
  const viablePoints = comparator ? items.filter(filter) : items;
  const sortedPoints = viablePoints.sort((a, b) => a - b);
  return sortedPoints.map((item) => (
    <DropdownItem key={item.toString()} id={item.toString()}>
      {item.toString()}
    </DropdownItem>
  ));
};

const InstanceFilter: React.FC<InstanceFilterProps> = ({
  minCPU,
  setMinCPU,
  maxCPU,
  setMaxCPU,
  minMem,
  setMinMem,
  maxMem,
  setMaxMem,
}) => {
  const [isMinCPUOpen, setMinCPUOpen] = React.useState(false);
  const [isMaxCPUOpen, setMaxCPUOpen] = React.useState(false);
  const [isMinMemOpen, setMinMemOpen] = React.useState(false);
  const [isMaxMemOpen, setMaxMemOpen] = React.useState(false);

  const platform = useSelector((store: Store) => store.cluster.platform);

  const [memoryDropdownPoints, cpuUnitPoints] = React.useMemo(() => {
    const instanceMap: Instance[] = platformInstanceMap[platform];
    const memoryUnits = instanceMap.map((item) => item.memory);
    const cpuUnits = instanceMap.map((item) => item.cpuUnits);
    return [_.uniq(memoryUnits), _.uniq(cpuUnits)];
  }, [platform]);

  const minimumMemoryDropdownItems = React.useMemo(() => {
    return dropdownItemGenerator(
      maxMem !== 0,
      (item) => item < maxMem,
      memoryDropdownPoints
    );
  }, [minMem, maxMem, memoryDropdownPoints]);

  const maxMemoryDropdownItems = React.useMemo(() => {
    return dropdownItemGenerator(
      minMem > 0 || maxMem === 0,
      (item) => item > minMem,
      memoryDropdownPoints
    );
  }, [minMem, maxMem, memoryDropdownPoints]);

  const minimumCPUDropdownItems = React.useMemo(() => {
    return dropdownItemGenerator(
      maxCPU !== 0,
      (item) => item < maxCPU,
      cpuUnitPoints
    );
  }, [minCPU, maxCPU, cpuUnitPoints]);

  const maxCPUDropdownItems = React.useMemo(() => {
    return dropdownItemGenerator(
      minCPU > 0 || maxCPU === 0,
      (item) => item > minCPU,
      cpuUnitPoints
    );
  }, [minCPU, maxCPU, memoryDropdownPoints]);

  const onSelect = (dropdownID: DropdownID) => (event: React.FormEvent) => {
    switch (dropdownID) {
      case DropdownID.MAX_CPU:
        setMaxCPU(Number(event.currentTarget.id));
        setMaxCPUOpen(false);
        break;

      case DropdownID.MIN_CPU:
        setMinCPU(Number(event.currentTarget.id));
        setMinCPUOpen(false);
        break;
      case DropdownID.MIN_MEM:
        setMinMem(Number(event.currentTarget.id));
        setMinMemOpen(false);
        break;
      case DropdownID.MAX_MEM:
        setMaxMem(Number(event.currentTarget.id));
        setMaxMemOpen(false);
        break;
    }
  };

  return (
    <div>
      <div>Advanced filters: </div>
      <Flex>
        <FlexItem>
          Min. CPU:
          <Dropdown
            onSelect={onSelect(DropdownID.MIN_CPU)}
            toggle={
              <DropdownToggle
                id="min-cpu-toggle"
                onToggle={() => setMinCPUOpen((o) => !o)}
                toggleIndicator={CaretDownIcon}
              >
                {minCPU ? minCPU.toString() : "Min. CPU"}
              </DropdownToggle>
            }
            isOpen={isMinCPUOpen}
            dropdownItems={minimumCPUDropdownItems}
          />
        </FlexItem>
        <FlexItem>
          Max. CPU:
          <Dropdown
            onSelect={onSelect(DropdownID.MAX_CPU)}
            toggle={
              <DropdownToggle
                id="max-cpu-toggle"
                onToggle={() => setMaxCPUOpen((o) => !o)}
                toggleIndicator={CaretDownIcon}
              >
                {maxCPU || "Max. CPU"}
              </DropdownToggle>
            }
            isOpen={isMaxCPUOpen}
            dropdownItems={maxCPUDropdownItems}
          />
        </FlexItem>
      </Flex>
      <Flex>
        <FlexItem>
          Min. Memory:
          <Dropdown
            onSelect={onSelect(DropdownID.MIN_MEM)}
            toggle={
              <DropdownToggle
                id="min-mem-toggle"
                onToggle={() => setMinMemOpen((o) => !o)}
                toggleIndicator={CaretDownIcon}
              >
                {minMem || "Min. Memory"}
              </DropdownToggle>
            }
            isOpen={isMinMemOpen}
            dropdownItems={minimumMemoryDropdownItems}
          />
        </FlexItem>
        <FlexItem>
          Max. Memory:
          <Dropdown
            onSelect={onSelect(DropdownID.MAX_MEM)}
            toggle={
              <DropdownToggle
                id="max-max-toggle"
                onToggle={() => setMaxMemOpen((o) => !o)}
                toggleIndicator={CaretDownIcon}
              >
                {maxMem || "Max. Memory"}
              </DropdownToggle>
            }
            isOpen={isMaxMemOpen}
            dropdownItems={maxMemoryDropdownItems}
          />
        </FlexItem>
      </Flex>
    </div>
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
  const [maxCPU, setMaxCPU] = React.useState(0);
  const [minCPU, setMinCPU] = React.useState(0);
  const [minMem, setMinMem] = React.useState(0);
  const [maxMem, setMaxMem] = React.useState(0);

  const FilterComponent = (
    <InstanceFilter
      minCPU={minCPU}
      setMinCPU={setMinCPU}
      maxCPU={maxCPU}
      setMaxCPU={setMaxCPU}
      minMem={minMem}
      setMinMem={setMinMem}
      maxMem={maxMem}
      setMaxMem={setMaxMem}
    />
  );

  return [FilterComponent, minCPU, maxCPU, minMem, maxMem];
};

export default useInstanceFilter;
