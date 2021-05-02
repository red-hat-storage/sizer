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
}) => (
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
          window.location.assign("https://access.redhat.com/articles/5001441")
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

export default SupportExceptionModal;
