import * as React from "react";
import { FormGroup } from "@patternfly/react-core";
import { useSelector } from "react-redux";
import { Store } from "../../redux";
import SelectionList from "./SelectList";
import { isCloudPlatform as affirmCloudPlatform } from "../../utils";
import { Slider } from "@mui/material";

type InstancePlannerProps = {
  cpu: number;
  setCPU: React.Dispatch<React.SetStateAction<number>>;
  memory: number;
  setMemory: React.Dispatch<React.SetStateAction<number>>;
  instance: string;
  setInstance: React.Dispatch<React.SetStateAction<string>>;
};

type ResourceSliderProps = {
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onChange: (newVvalue: number) => void;
};

const ResourceSlider: React.FC<ResourceSliderProps> = ({
  initialValue,
  onChange,
  step,
  min,
  max,
}) => {
  const onValueChange = (value: number) => {
    onChange(value);
  };
  return (
    <Slider
      defaultValue={initialValue}
      step={step}
      min={min}
      max={max}
      marks
      onChange={(event, newValue) => onValueChange(newValue as number)}
      valueLabelDisplay="auto"
    />
  );
};

export const InstancePlanner: React.FC<InstancePlannerProps> = ({
  cpu,
  setCPU,
  memory,
  setMemory,
  instance,
  setInstance,
}) => {
  const platform = useSelector((store: Store) => store.cluster.platform);
  const isCloudPlatform = affirmCloudPlatform(platform);

  const onSelect = (dropdown: string) => (amount: number) => {
    if (dropdown === "NodeCPU") {
      setCPU(amount);
    } else {
      setMemory(amount);
    }
  };

  return (
    <>
      {isCloudPlatform && (
        <FormGroup label="Instance Type" fieldId="instance-type">
          <SelectionList
            id="instance-type"
            selection={instance}
            setInstance={setInstance}
          />
        </FormGroup>
      )}
      {!isCloudPlatform && (
        <>
          <FormGroup label="CPU unit count" fieldId="cpu-dropdown">
            <ResourceSlider
              min={8}
              max={200}
              initialValue={cpu || 8}
              step={2}
              onChange={onSelect("NodeCPU")}
            />
            <span>{cpu} Cores</span>
          </FormGroup>
          <FormGroup label="Memory unit count" fieldId="memory-dropdown">
            <ResourceSlider
              min={8}
              max={512}
              initialValue={memory || 8}
              step={4}
              onChange={onSelect("NodeMem")}
            />
            <span>{memory} GB</span>
          </FormGroup>
        </>
      )}
    </>
  );
};
