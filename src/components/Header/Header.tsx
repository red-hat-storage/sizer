import * as React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import {
  Page,
  PageHeader,
  PageHeaderTools,
  Tab,
  Tabs,
  TabTitleText,
  DropdownItem,
  Dropdown,
  DropdownToggle,
} from "@patternfly/react-core";
import {
  CaretDownIcon,
  ExternalLinkSquareAltIcon,
} from "@patternfly/react-icons";

const dropdownItems = [
  <DropdownItem id="about">About</DropdownItem>,
  <DropdownItem id="faq">
    <Link to="/faq" target="_blank" className="faq-link">
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
  return (
    <PageHeader
      logo="OCS Sizer Tool"
      logoProps={{ href: "/" }}
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
