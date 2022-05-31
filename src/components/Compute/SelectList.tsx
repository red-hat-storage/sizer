import * as React from "react";
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from "@patternfly/react-core";
import { Instance } from "../../types";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import useInstanceFilter from "./InstanceFilter";
import { platformInstanceMap } from "../../cloudInstance";

type SelectionListProps = {
  setInstance: any;
  selection: string;
};

const getDescription = (instance: Instance): string => {
  let description = `Memory: ${instance.memory}, CPU: ${instance.cpuUnits}`;
  if (instance.instanceStorage && instance.instanceStorage !== 0) {
    description += `, Storage: ${instance.instanceStorage}`;
  }
  return description;
};

const SelectionList: React.FC<SelectionListProps> = ({
  setInstance,
  selection,
}) => {
  const [isOpen, setOpen] = React.useState(false);

  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject
  ) => {
    setInstance(selection);
    setOpen(false);
  };

  const [FilterComponent, minCPU, maxCPU, minMem, maxMem] = useInstanceFilter();

  const platform = useSelector((store: Store) => store.cluster.platform);
  const filteredInstances = React.useMemo(() => {
    const instanceMap: Instance[] = platformInstanceMap[platform];
    const shouldFilter = minCPU > 0 || maxCPU > 0 || minMem > 0 || maxMem > 0;
    return shouldFilter
      ? instanceMap.filter((instance) => {
          if (minCPU > 0 && instance.cpuUnits < minCPU) {
            return false;
          }
          if (maxCPU > 0 && instance.cpuUnits > maxCPU) {
            return false;
          }
          if (minMem > 0 && instance.memory < minMem) {
            return false;
          }
          if (maxMem > 0 && instance.memory > maxMem) {
            return false;
          }
          return true;
        })
      : instanceMap;
  }, [minCPU, maxCPU, minMem, maxMem, platform]);
  const onClear = () => {
    setInstance(null);
  };

  return (
    <>
      {FilterComponent}
      {filteredInstances.length > 0 ? (
        <Select
          variant={SelectVariant.typeahead}
          onToggle={(isExpanded) => setOpen(isExpanded)}
          onSelect={onSelect}
          isOpen={isOpen}
          onClear={onClear}
          selections={selection}
          className="compute-ms-create-form__select"
        >
          {filteredInstances.map((instance) => (
            <SelectOption
              key={instance.name}
              value={instance.name}
              description={getDescription(instance)}
            />
          ))}
        </Select>
      ) : (
        <>No instances are present for the selected filters.</>
      )}
    </>
  );
};

export default SelectionList;
