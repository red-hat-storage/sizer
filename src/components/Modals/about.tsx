import * as React from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  TextContent,
  TextVariants,
  Text,
  Title,
  TitleSizes,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import "./about.css";

type AboutModalProps = {
  onClose: () => void;
  isOpen: boolean;
};
const AboutModal: React.FC<AboutModalProps> = ({ onClose, isOpen }) => (
  <Modal title="About ODF Sizer" isOpen={isOpen} onClose={onClose} width="50%">
    <TextContent>
      <Text component={TextVariants.h5}>
        The purpose of the ODF Sizing Tool is to help architects design ODF
        configurations for OCP clusters. Inputs include desired cluster capacity
        and node building block parameters. Outputs include guidance on how to
        design your ODF layout to achieve the desired cluster capacity. Relevant
        Red Hat SKU information is also provided to assist with cost estimation.
      </Text>
    </TextContent>
    <div className="author-section">
      <Title headingLevel="h3" size={TitleSizes["xl"]}>
        Authors
      </Title>
      <Flex justifyContent={{ default: "justifyContentSpaceEvenly" }}>
        <FlexItem>
          <div>
            <div className="about-image">
              <img
                className="about-image__item"
                src="../../../assets/images/chris.jpg"
              />
            </div>
            <Title headingLevel="h4" className="about-image-item__name">
              Chris Blum
            </Title>
          </div>
        </FlexItem>
        <FlexItem>
          <div>
            <div className="about-image">
              <img
                className="about-image__item"
                src="../../../assets/images/bipul.jpg"
              />
            </div>
            <Title headingLevel="h4" className="about-image-item__name">
              Bipul Adhikari
            </Title>
          </div>
        </FlexItem>
      </Flex>
      <TextContent>
        <Text component={TextVariants.h5}>
          You can support us by nominating us as{" "}
          <Link to="red.ht/programrequest" target="_blank">
            RedHat Champions{" "}
          </Link>
          or by sending us{" "}
          <Link to="rewardzone.redhat.com" target="_blank">
            reward points.
          </Link>
        </Text>
      </TextContent>
    </div>
  </Modal>
);

export default AboutModal;
