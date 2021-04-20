import * as React from "react";
import { Button, Modal, Title } from "@patternfly/react-core";

type SupportExceptionModalProps = {
  onClose: () => void;
  isOpen: boolean;
  header: string;
  message: string;
};

const SupportExceptionModal: React.FC<SupportExceptionModalProps> = ({
  onClose,
  isOpen,
  header,
  message,
}) => {
  return (
    <Modal
      title="Support Exception Required"
      isOpen={isOpen}
      onClose={onClose}
      titleIconVariant="danger"
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
      <Title headingLevel="h2">{header}</Title>
      <div>{message}</div>
    </Modal>
  );
};

export default SupportExceptionModal;
