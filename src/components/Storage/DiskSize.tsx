import * as React from "react";
import { FormGroup, NumberInput } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { useSelector, useDispatch } from "react-redux";
import { setFlashSize, setUsableCapacity, Store } from "../../redux";
import { MachineSet } from "../../types";
import * as _ from "lodash";
import { isCloudPlatform } from "../../utils";

type DiskSizeProps = {
  machine?: MachineSet;
};

const DiskSize: React.FC<DiskSizeProps> = ({ machine }) => {
  const ocsState = useSelector((state: Store) => state.ocs);
  const platform = useSelector((state: Store) => state.cluster.platform);

  const dispatch = useDispatch();

  const increment = (
    action: typeof setFlashSize | typeof setUsableCapacity
  ) => () => {
    let payload = 0;
    if (action === setFlashSize) {
      payload = ocsState.flashSize + 0.1;
    } else {
      payload =
        ocsState.usableCapacity < 1
          ? ocsState.usableCapacity + 0.1
          : ocsState.usableCapacity + 1;
    }
    payload = +payload.toFixed(1);
    dispatch(action(payload));
  };

  const decrement = (
    action: typeof setFlashSize | typeof setUsableCapacity
  ) => () => {
    let payload = 0;
    if (action === setFlashSize) {
      payload = ocsState.flashSize - 0.1;
    } else {
      payload =
        ocsState.usableCapacity <= 1
          ? ocsState.usableCapacity - 0.1
          : ocsState.usableCapacity - 1;
    }
    payload = +payload.toFixed(1);
    dispatch(action(payload));
  };

  const changeText = (type: typeof setFlashSize | typeof setUsableCapacity) => (
    e: React.FormEvent<HTMLInputElement>
  ) => {
    const inputValue = Number(e.currentTarget.value);
    if (type === setFlashSize && inputValue > -1 && inputValue <= 16) {
      dispatch(setFlashSize(inputValue));
    }
    if (type === setUsableCapacity && inputValue > -1 && inputValue <= 1000) {
      dispatch(setUsableCapacity(inputValue));
    }
  };

  const isDiskSizeTechPreview = React.useMemo(() => ocsState.flashSize > 4.0, [
    ocsState.flashSize,
  ]);

  const isDiskSizeZero = React.useMemo(
    () => ocsState.flashSize === 0 || ocsState.flashSize < 0.1,
    [ocsState.flashSize]
  );

  const disableDiskSize = isCloudPlatform(platform)
    ? machine?.instanceStorage === 0 || _.isUndefined(machine?.instanceStorage)
    : true;

  const isUsableCapacityZero = React.useMemo(
    () => ocsState.usableCapacity === 0 || ocsState.usableCapacity < 0.1,
    [ocsState.usableCapacity]
  );

  const diskSizeHelperText = isDiskSizeZero
    ? "Minimum disk size should be of 0.1 TB"
    : "Disks greater than 4TB is not tested and is still a tech preview feature.";

  return (
    <>
      <FormGroup
        label="Flash Disk Size (TB)"
        fieldId="flash-input"
        validated={
          isDiskSizeTechPreview || isDiskSizeZero ? "error" : "success"
        }
        helperTextInvalid={diskSizeHelperText}
        helperTextInvalidIcon={<WarningTriangleIcon />}
      >
        <NumberInput
          value={ocsState.flashSize}
          min={0.1}
          max={16}
          onMinus={decrement(setFlashSize)}
          onPlus={increment(setFlashSize)}
          onChange={changeText(setFlashSize)}
          inputName="diskSize"
          inputAriaLabel="Disk size"
          unit="TB"
          id="flash-input"
          isDisabled={disableDiskSize}
        />
      </FormGroup>
      <FormGroup
        label="Usable Capacity Required (TB)"
        fieldId="usable-input"
        validated={isUsableCapacityZero ? "error" : "default"}
        helperTextInvalid="Minimum usable capacity should be at least 0.1 TB"
      >
        <NumberInput
          value={ocsState.usableCapacity}
          min={0.1}
          max={1000}
          onMinus={decrement(setUsableCapacity)}
          onPlus={increment(setUsableCapacity)}
          onChange={changeText(setUsableCapacity)}
          inputName="usableCapacity"
          inputAriaLabel="Usable capacity"
          unit="TB"
          id="usable-input"
        />
      </FormGroup>
    </>
  );
};

export default DiskSize;
