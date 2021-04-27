import { Modal, TextContent, TextVariants, Text } from "@patternfly/react-core";
import * as React from "react";

type AboutModalProps = {
  onClose: () => void;
  isOpen: boolean;
};
const AboutModal: React.FC<AboutModalProps> = ({ onClose, isOpen }) => (
  <Modal title="About ODF Sizer" isOpen={isOpen} onClose={onClose}>
    <TextContent>
      <Text component={TextVariants.h5}>
        The purpose of the ODF Sizing Tool is to help architects design ODF
        configurations for OCP clusters. Inputs include desired cluster capacity
        and node building block parameters. Outputs include guidance on how to
        design your ODF layout to achieve the desired cluster capacity. Relevant
        Red Hat SKU information is also provided to assist with cost estimation.
      </Text>
    </TextContent>
  </Modal>
);

export default AboutModal;
