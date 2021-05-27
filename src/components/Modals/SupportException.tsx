import * as React from "react";
import { Button, Modal } from "@patternfly/react-core";
import { ExceptionReport } from "../Exception/Exception";
import { State } from "../../types";
import { SupportExceptionObject } from "../Exception/utils";

type SupportExceptionModalProps = {
  onClose: () => void;
  isOpen: boolean;
  exceptions: SupportExceptionObject[];
};

const SupportExceptionModal: React.FC<SupportExceptionModalProps> = ({
  onClose,
  isOpen,
  exceptions,
}) => {
  React.useEffect(() => {
    const modal = document.getElementById("support-exception-modal");
    const cb = (event: any) => {
      const currentlySelected = event?.originalTarget;
      if (!modal?.contains(currentlySelected)) onClose();
    };
    document?.addEventListener("click", cb);
    return () => {
      document?.removeEventListener("click", cb);
    };
  });
  return (
    <Modal
      title="Support Exception Required"
      isOpen={isOpen}
      onClose={onClose}
      titleIconVariant="danger"
      id="support-exception-modal"
      actions={[
        <Button
          key="link"
          variant="link"
          onClick={() =>
            window.open("https://access.redhat.com/articles/5001441", "_blank")
          }
        >
          Check Support Matrix
        </Button>,
      ]}
    >
      <div>
        <ExceptionReport exceptions={exceptions} />
      </div>
    </Modal>
  );
};

export default SupportExceptionModal;
