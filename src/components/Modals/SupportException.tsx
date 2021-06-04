import * as React from "react";
import { Button, Modal } from "@patternfly/react-core";
import { ExceptionReport } from "../Exception/Exception";
import { useCloseModal } from "../../hooks/modal";
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
  useCloseModal(onClose, isOpen);
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
            window.open("https://access.redhat.com/articles/4731161", "_blank")
          }
        >
          Supportability and Interoperability Guide
        </Button>,
        <Button
          key="link"
          variant="link"
          onClick={() =>
            window.open("https://access.redhat.com/labs/ocssi/", "_blank")
          }
        >
          Supportability and Interoperability Checker
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
