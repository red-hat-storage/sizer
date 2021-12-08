import * as React from "react";
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from "@patternfly/react-core";
import { platformInstanceMap } from "../../cloudInstance";
import { Instance } from "../../types";
import { useSelector } from "react-redux";
import { Store } from "../../redux";

type SelectionListProps = {
  setInstance: any;
  selection: string;
  isOpen: boolean;
  setOpen: any;
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
  isOpen,
  setOpen,
}) => {
  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    _isPlaceholder?: boolean
  ) => {
    setInstance(selection);
    setOpen(false);
  };

  const platform = useSelector((store: Store) => store.cluster.platform);

  const onClear = () => {
    setInstance(null);
  };

  return (
    <Select
      variant={SelectVariant.typeahead}
      onToggle={() => setOpen((open: any) => !open)}
      onSelect={onSelect}
      isOpen={isOpen}
      onClear={onClear}
      selections={selection}
      className="compute-ms-create-form__select"
    >
      {platformInstanceMap[platform].map((instance) => (
        <SelectOption
          key={instance.name}
          value={instance.name}
          description={getDescription(instance)}
        />
      ))}
    </Select>
  );
};

export default SelectionList;
