// @ts-nocheck
import React from "react";
import {
  Avatar,
  Brand,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Dropdown,
  DropdownGroup,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  Gallery,
  GalleryItem,
  KebabToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSection,
  PageSectionVariants,
  PageSidebar,
  SkipToContent,
  TextContent,
  Text,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import CogIcon from "@patternfly/react-icons/dist/js/icons/cog-icon";
import HelpIcon from "@patternfly/react-icons/dist/js/icons/help-icon";
const imgBrand = "/v4/images/pfLogo.ffdafb0c74aa4c9c011251aa8f0c144c.svg";
const imgAvatar = "/v4/images/avatarImg.6daf7202106fbdb9c72360d30a6ea85d.svg";
import {
  QuickStartContext,
  QuickStartContextValues,
} from "@cloudmosaic/quickstarts";

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      isKebabDropdownOpen: false,
      activeItem: 0,
    };
    this.onDropdownToggle = (isDropdownOpen) => {
      this.setState({
        isDropdownOpen,
      });
    };

    this.onDropdownSelect = (event) => {
      this.setState({
        isDropdownOpen: !this.state.isDropdownOpen,
      });
    };

    this.onKebabDropdownToggle = (isKebabDropdownOpen) => {
      this.setState({
        isKebabDropdownOpen,
      });
    };

    this.onKebabDropdownSelect = (event) => {
      this.setState({
        isKebabDropdownOpen: !this.state.isKebabDropdownOpen,
      });
    };

    this.onNavSelect = (result) => {
      this.setState({
        activeItem: result.itemId,
      });
    };
  }

  render() {
    const { isDropdownOpen, isKebabDropdownOpen, activeItem } = this.state;

    const PageNav = (
      <Nav variant="tertiary" onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavItem itemId={0} isActive={activeItem === 0}>
            System Panel
          </NavItem>
          <NavItem itemId={1} isActive={activeItem === 1}>
            Policy
          </NavItem>
          <NavItem itemId={2} isActive={activeItem === 2}>
            Authentication
          </NavItem>
          <NavItem itemId={3} isActive={activeItem === 3}>
            Network Services
          </NavItem>
          <NavItem itemId={4} isActive={activeItem === 4}>
            Server
          </NavItem>
        </NavList>
      </Nav>
    );
    const kebabDropdownItems = [
      <DropdownItem>
        <CogIcon /> Settings
      </DropdownItem>,
      <DropdownItem>
        <HelpIcon /> Help
      </DropdownItem>,
    ];
    const userDropdownItems = [
      <DropdownGroup key="group 2">
        <DropdownItem key="group 2 profile">My profile</DropdownItem>
        <DropdownItem key="group 2 user" component="button">
          User management
        </DropdownItem>
        <DropdownItem key="group 2 logout">Logout</DropdownItem>
      </DropdownGroup>,
    ];
    const headerTools = (
      <PageHeaderTools>
        <PageHeaderToolsGroup
          visibility={{
            default: "hidden",
            lg: "visible",
          }} /** the settings and help icon buttons are only visible on desktop sizes and replaced by a kebab dropdown for other sizes */
        >
          <PageHeaderToolsItem>
            <Button aria-label="Settings actions" variant={ButtonVariant.plain}>
              <CogIcon />
            </Button>
          </PageHeaderToolsItem>
          <PageHeaderToolsItem>
            <Button aria-label="Help actions" variant={ButtonVariant.plain}>
              <HelpIcon />
            </Button>
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem
            visibility={{
              lg: "hidden",
            }} /** this kebab dropdown replaces the icon buttons and is hidden for desktop sizes */
          >
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onKebabDropdownSelect}
              toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
              isOpen={isKebabDropdownOpen}
              dropdownItems={kebabDropdownItems}
            />
          </PageHeaderToolsItem>
          <PageHeaderToolsItem
            visibility={{
              default: "hidden",
              md: "visible",
            }} /** this user dropdown is hidden on mobile sizes */
          >
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  John Smith
                </DropdownToggle>
              }
              dropdownItems={userDropdownItems}
            />
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        <Avatar src={imgAvatar} alt="Avatar image" />
      </PageHeaderTools>
    );

    const Header = (
      <PageHeader
        logo={<Brand src={imgBrand} alt="Patternfly Logo" />}
        headerTools={headerTools}
        showNavToggle
      />
    );
    const pageId = "main-content-page-layout-tertiary-nav";
    const PageSkipToContent = (
      <SkipToContent href={`#${pageId}`}>Skip to content</SkipToContent>
    );

    const PageBreadcrumb = (
      <Breadcrumb>
        <BreadcrumbItem>Section home</BreadcrumbItem>
        <BreadcrumbItem to="#">Section title</BreadcrumbItem>
        <BreadcrumbItem to="#">Section title</BreadcrumbItem>
        <BreadcrumbItem to="#" isActive>
          Section landing
        </BreadcrumbItem>
      </Breadcrumb>
    );

    const onButtonClick = () => {
      const { setActiveQuickStart } = this.props.context;
      setActiveQuickStart && setActiveQuickStart("sample");
    };

    return (
      <React.Fragment>
        <Page
          header={Header}
          breadcrumb={PageBreadcrumb}
          tertiaryNav={PageNav}
          isManagedSidebar
          isTertiaryNavWidthLimited
          isBreadcrumbWidthLimited
          skipToContent={PageSkipToContent}
          mainContainerId={pageId}
          isTertiaryNavGrouped
          isBreadcrumbGrouped
          additionalGroupedContent={
            <PageSection variant={PageSectionVariants.light}>
              <TextContent>
                <Text component="h1">Open quickstart</Text>
                <Button onClick={onButtonClick}>Open quickstart</Button>
              </TextContent>
            </PageSection>
          }
          groupProps={{
            sticky: "top",
          }}
        >
          <PageSection>
            <Gallery hasGutter>
              {Array.apply(0, Array(20)).map((x, i) => (
                <GalleryItem key={i}>
                  <Card>
                    <CardBody>This is a card</CardBody>
                  </Card>
                </GalleryItem>
              ))}
            </Gallery>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

export function DemoPage(props) {
  const context = React.useContext<QuickStartContextValues>(QuickStartContext);

  return <Demo context={context} {...props} />;
}

export default DemoPage;
