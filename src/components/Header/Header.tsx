import * as React from "react";
import {
  PageHeader,
  PageHeaderTools,
  Brand,
  Title,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { HelpIcon, InfoIcon } from "@patternfly/react-icons";
import brand from "../../../assets/images/ocs-logo.png";
import "./header.css";

const HeaderTools: React.FC<HeaderToolsProps> = ({ onSelect }) => {
  return (
    <Flex
      className="header-tools"
      justifyContent={{ default: "justifyContentSpaceEvenly" }}
    >
      <FlexItem>
        <InfoIcon
          className="small-icon"
          id="about"
          onClick={() => onSelect("about")}
        />
      </FlexItem>
      <FlexItem>
        <HelpIcon
          className="small-icon"
          id="faq"
          onClick={() => onSelect("faq")}
        />
      </FlexItem>
    </Flex>
  );
};

const Header: React.FC<HeaderToolsProps> = ({ onSelect }) => {
  const PUBLIC_PATH = process.env.PUBLIC_PATH
    ? `${process.env.PUBLIC_PATH}index.html`
    : "/";
  return (
    <PageHeader
      logo={<Brand src={brand} alt="OpenShift Data Foundation" />}
      topNav={
        <Title headingLevel="h2" size="xl">
          ODF Sizer Tool
        </Title>
      }
      logoProps={{ href: PUBLIC_PATH }}
      headerTools={
        <PageHeaderTools>
          <HeaderTools onSelect={onSelect} />
        </PageHeaderTools>
      }
    />
  );
};

export default Header;

type HeaderToolsProps = {
  onSelect: (selectedItem: string) => void;
};
