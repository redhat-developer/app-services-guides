import React, { FunctionComponent } from "react";
import {
  PageSection,
  PageSectionVariants,
  TextContent,
  Text,
  Divider,
  Gallery,
  GalleryItem,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import {
  QuickStart,
  getQuickStartStatus,
  QuickStartContextValues,
  QuickStartContext,
  QuickStartTile,
  filterQuickStarts,
  QuickStartCatalogEmptyState,
  QUICKSTART_SEARCH_FILTER_KEY,
  QuickStartCatalogFilterSearchWrapper,
  QuickStartCatalogFilterCountWrapper,
  clearQuickStartFilters,
  QuickStartsLoader,
  LoadingBox,
  QuickStartCatalog,
} from "@cloudmosaic/quickstarts";

type MasQuickStartCatalogProps = {
  quickStarts: QuickStart[];
};

const MasQuickStartCatalog: React.FC<MasQuickStartCatalogProps> = ({
  quickStarts,
}) => {
  const {
    activeQuickStartID,
    allQuickStartStates,
  } = React.useContext<QuickStartContextValues>(QuickStartContext);

  const initialQueryParams = new URLSearchParams(window.location.search);
  const initialSearchQuery =
    initialQueryParams.get(QUICKSTART_SEARCH_FILTER_KEY) || "";

  const sortFnc = (q1: QuickStart, q2: QuickStart) =>
    q1.spec.displayName.localeCompare(q2.spec.displayName);

  const initialFilteredQuickStarts = filterQuickStarts(
    quickStarts,
    initialSearchQuery,
    [],
    allQuickStartStates
  ).sort(sortFnc);

  const [filteredQuickStarts, setFilteredQuickStarts] = React.useState<
    QuickStart[]
  >(initialFilteredQuickStarts);

  const onSearchInputChange = (searchValue: string) => {
    const result = filterQuickStarts(
      quickStarts,
      searchValue,
      [],
      allQuickStartStates
    ).sort(sortFnc);
    setFilteredQuickStarts(result);
  };

  const CatalogWithSections = (
    <>
      <PageSection>
        <TextContent>
          <Text component="h2">Quick starts</Text>
          <Text component="p">Step-by-step instructions and tasks</Text>
        </TextContent>
        <Gallery className="co-quick-start-catalog__gallery" hasGutter>
          {quickStarts
            .filter(
              (quickStart) =>
                !quickStart.spec.type ||
                quickStart.spec.type.text !== "Documentation"
            )
            .map((quickStart) => {
              const {
                metadata: { name: id },
              } = quickStart;

              return (
                <GalleryItem key={id}>
                  <QuickStartTile
                    quickStart={quickStart}
                    isActive={id === activeQuickStartID}
                    status={getQuickStartStatus(allQuickStartStates, id)}
                  />
                </GalleryItem>
              );
            })}
        </Gallery>
      </PageSection>
      <PageSection>
        <Divider />
      </PageSection>
      <PageSection>
        <TextContent>
          <Text component="h2">Documentation</Text>
          <Text component="p">Technical information for using the service</Text>
        </TextContent>
        <Gallery className="co-quick-start-catalog__gallery" hasGutter>
          {quickStarts
            .filter(
              (quickStart) => quickStart.spec.type?.text === "Documentation"
            )
            .map((quickStart) => {
              const {
                metadata: { name: id },
              } = quickStart;

              return (
                <GalleryItem key={id}>
                  <QuickStartTile
                    quickStart={quickStart}
                    isActive={id === activeQuickStartID}
                    status={getQuickStartStatus(allQuickStartStates, id)}
                  />
                </GalleryItem>
              );
            })}
        </Gallery>
      </PageSection>
    </>
  );

  const clearFilters = () => {
    clearQuickStartFilters();
    setFilteredQuickStarts(quickStarts.sort(sortFnc));
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Resources</Text>
        </TextContent>
      </PageSection>
      <Divider component="div" />
      <PageSection
        padding={{
          default: "noPadding",
        }}
      >
        <Toolbar usePageInsets>
          <ToolbarContent>
            <QuickStartCatalogFilterSearchWrapper
              onSearchInputChange={onSearchInputChange}
            />
            <QuickStartCatalogFilterCountWrapper
              quickStartsCount={filteredQuickStarts.length}
            />
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <Divider component="div" />
      {filteredQuickStarts.length === 0 ? (
        <PageSection>
          <QuickStartCatalogEmptyState clearFilters={clearFilters} />
        </PageSection>
      ) : filteredQuickStarts.length !== quickStarts.length ? (
        <PageSection>
          <QuickStartCatalog quickStarts={filteredQuickStarts} />
        </PageSection>
      ) : (
        CatalogWithSections
      )}
    </>
  );
};

const QuickStartCatalogFederated: FunctionComponent = () => (
  <QuickStartsLoader>
    {(quickStarts: QuickStart[], loaded: boolean) =>
      loaded ? (
        <MasQuickStartCatalog quickStarts={quickStarts} />
      ) : (
        <LoadingBox />
      )
    }
  </QuickStartsLoader>
);

export default QuickStartCatalogFederated;
