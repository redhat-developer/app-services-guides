// @ts-nocheck
import React from "react";
import {
  Page,
  Nav,
  NavList,
  NavItem,
  PageSidebar,
  PageHeader,
} from "@patternfly/react-core";
import QuickStartCatalogFederated from "@app/QuickStartCatalogFederated";

const DemoPage: React.FunctionComponent = () => {
  const AppHeader = (
    <PageHeader
      logo={<div>Quick starts for MAS</div>}
      showNavToggle
      isNavOpen
    />
  );

  const AppNav = (
    <Nav aria-label="Nav">
      <NavList>
        <NavItem to="/">Home</NavItem>
      </NavList>
    </Nav>
  );

  const AppSidebar = <PageSidebar isNavOpen nav={AppNav} />;

  return (
    <Page header={AppHeader} sidebar={AppSidebar} isManagedSidebar>
      <QuickStartCatalogFederated />
    </Page>
  );
};

export default DemoPage;
