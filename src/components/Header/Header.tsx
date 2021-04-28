import * as React from "react";
import { Link } from "react-router-dom";
import {
  PageHeader,
  PageHeaderTools,
  DropdownItem,
  Dropdown,
  DropdownToggle,
} from "@patternfly/react-core";
import {
  CaretDownIcon,
  ExternalLinkSquareAltIcon,
} from "@patternfly/react-icons";

const dropdownItems = [
  <DropdownItem id="about" key="about">
    About
  </DropdownItem>,
  <DropdownItem id="faq" key="faq">
    <Link to="./faq" target="_blank" className="faq-link">
      FAQ <ExternalLinkSquareAltIcon />
    </Link>
  </DropdownItem>,
];

const HeaderTools: React.FC<HeaderToolsProps> = ({ onSelect }) => {
  const [isOpen, setOpen] = React.useState(false);
  return (
    <Dropdown
      toggle={
        <DropdownToggle
          id="toggle-id"
          onToggle={() => setOpen((open) => !open)}
          toggleIndicator={CaretDownIcon}
        ></DropdownToggle>
      }
      onSelect={onSelect}
      isOpen={isOpen}
      dropdownItems={dropdownItems}
    />
  );
};

const Header: React.FC<HeaderToolsProps> = ({ onSelect }) => {
  const PUBLIC_PATH = process.env.PUBLIC_PATH
    ? `${process.env.PUBLIC_PATH}index.html`
    : "/";
  return (
    <PageHeader
      logo="ODF Sizer Tool"
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
  onSelect: (event?: React.SyntheticEvent<HTMLDivElement>) => void;
};
