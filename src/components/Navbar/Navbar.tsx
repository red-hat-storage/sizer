import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Nav, NavItem, NavList } from "@patternfly/react-core";
import * as _ from "lodash";
import "./navBar.css";

const Navigation: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = React.useState<string>("workloads");
  const routes = ["workloads", "storage", "compute", "results"];

  const onSelect = React.useCallback(
    (result: { itemId: string | number }) => {
      navigate(`/${result.itemId}`);
      setActiveItem(result.itemId as string);
    },
    [history]
  );

  React.useEffect(() => {
    const pathname = location?.pathname?.replace?.("/", "");
    if (pathname) {
      setActiveItem(pathname);
    }
  }, [location]);

  return (
    <Nav onSelect={onSelect} variant="horizontal" aria-label="Navigation bar">
      <NavList>
        {routes.map((route: string) => (
          <NavItem
            id={`nav-item-${route}`}
            key={route}
            preventDefault
            itemId={route}
            isActive={activeItem === route}
          >
            {_.capitalize(route)}
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

export default Navigation;
