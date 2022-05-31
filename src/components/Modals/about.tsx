import * as React from "react";
import {
  Modal,
  TextContent,
  TextVariants,
  Text,
  Title,
  TitleSizes,
  Flex,
  FlexItem,
  Button,
} from "@patternfly/react-core";
import { useCloseModal } from "../../hooks/modal";
import Chris from "../../../assets/images/chris.jpg";
import Bipul from "../../../assets/images/bipul.jpg";
import "./about.css";

type AboutModalProps = {
  onClose: () => void;
  isOpen: boolean;
};
const AboutModal: React.FC<AboutModalProps> = ({ onClose, isOpen }) => {
  useCloseModal(onClose, isOpen);
  return (
    <Modal
      title="About ODF Sizer"
      isOpen={isOpen}
      onClose={onClose}
      width="50%"
    >
      <TextContent>
        <Text component={TextVariants.h5}>
          The purpose of the ODF Sizing Tool is to help architects design ODF
          configurations for OCP clusters. Inputs include desired cluster
          capacity and node building block parameters. Outputs include guidance
          on how to design your ODF layout to achieve the desired cluster
          capacity. Relevant Red Hat SKU information is also provided to assist
          with cost estimation.
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
                <img className="about-image__item" src={Chris} />
              </div>
              <Title headingLevel="h4" className="about-image-item__name">
                Chris Blum (cblum@redhat.com)
              </Title>
            </div>
          </FlexItem>
          <FlexItem>
            <div>
              <div className="about-image">
                <img className="about-image__item" src={Bipul} />
              </div>
              <Title headingLevel="h4" className="about-image-item__name">
                Bipul Adhikari (badhikar@redhat.com)
              </Title>
            </div>
          </FlexItem>
        </Flex>
        <TextContent>
          <Text component={TextVariants.h5}>
            You can support us by nominating us as{" "}
            <Button
              className="about-button--padding-none"
              variant="link"
              onClick={() =>
                window.open(
                  "https://source.redhat.com/groups/public/portfolio-engagement/advocacy_programs/champions",
                  "_blank"
                )
              }
            >
              RedHat Champions
            </Button>{" "}
            or by sending us{" "}
            <Button
              className="about-button--padding-none"
              variant="link"
              onClick={() =>
                window.open("https://rewardzone.redhat.com", "_blank")
              }
            >
              reward points.
            </Button>
          </Text>
        </TextContent>
      </div>
    </Modal>
  );
};

export default AboutModal;
