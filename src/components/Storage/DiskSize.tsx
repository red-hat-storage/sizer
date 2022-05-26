import * as React from "react";
import { FormGroup, NumberInput } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { useSelector, useDispatch } from "react-redux";
import { setFlashSize, setUsableCapacity, Store } from "../../redux";
import { Platform } from "../../types";

const DiskSize: React.FC = () => {
  const ocsState = useSelector((state: Store) => state.ocs);
  const platform = useSelector((state: Store) => state.cluster.platform);

  const dispatch = useDispatch();

  const increment =
    (action: typeof setFlashSize | typeof setUsableCapacity) => () => {
      let payload = 0;
      if (action === setFlashSize) {
        payload = ocsState.flashSize + 0.1;
      } else {
        payload = ocsState.usableCapacity + 1;
      }
      payload = +payload.toFixed(1);
      dispatch(action(payload));
    };

  const decrement =
    (action: typeof setFlashSize | typeof setUsableCapacity) => () => {
      let payload = 0;
      if (action === setFlashSize) {
        payload = ocsState.flashSize - 0.1;
      } else {
        payload = ocsState.usableCapacity - 1;
      }
      payload = +payload.toFixed(1);
      dispatch(action(payload));
    };

  const changeText =
    (type: typeof setFlashSize | typeof setUsableCapacity) =>
    (e: React.FormEvent<HTMLInputElement>) => {
      const inputValue = Number(e.currentTarget.value);
      if (type === setFlashSize && inputValue > -1 && inputValue <= 16) {
        dispatch(setFlashSize(inputValue));
      }
      if (type === setUsableCapacity && inputValue > -1 && inputValue <= 1000) {
        dispatch(setUsableCapacity(inputValue));
      }
    };

  const isDiskSizeTechPreview = React.useMemo(
    () => (ocsState.flashSize > 4.0 ? "error" : "default"),
    [ocsState.flashSize]
  );

  const disableDiskSize = platform === Platform.AWS;

  return (
    <>
      <FormGroup
        label="Flash Disk Size (TB)"
        fieldId="flash-input"
        validated={isDiskSizeTechPreview}
        helperTextInvalid="Disks greater than 4TB is not tested and is still a tech preview feature."
        helperTextInvalidIcon={<WarningTriangleIcon />}
      >
        <NumberInput
          value={ocsState.flashSize}
          min={0}
          max={16}
          onMinus={decrement(setFlashSize)}
          onPlus={increment(setFlashSize)}
          onChange={changeText(setFlashSize)}
          inputName="diskSize"
          inputAriaLabel="Disk Size"
          unit="TB"
          id="flash-input"
          isDisabled={disableDiskSize}
        />
      </FormGroup>
      <FormGroup label="Usable Capacity Required (TB)" fieldId="usable-input">
        <NumberInput
          value={ocsState.usableCapacity}
          min={0}
          max={1000}
          onMinus={decrement(setUsableCapacity)}
          onPlus={increment(setUsableCapacity)}
          onChange={changeText(setUsableCapacity)}
          inputName="diskSize"
          inputAriaLabel="Disk Size"
          unit="TB"
          id="usable-input"
        />
      </FormGroup>
    </>
  );
};

export default DiskSize;
