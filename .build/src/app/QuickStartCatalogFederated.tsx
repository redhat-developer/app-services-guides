import React, { FunctionComponent, useContext } from "react";
import {
  TextContent,
  Text,
  Divider,
  Gallery,
  GalleryItem,
  ToolbarContent,
} from "@patternfly/react-core";
import {
  getQuickStartStatus,
  QuickStartContextValues,
  QuickStartContext,
  QuickStartTile,
  filterQuickStarts,
  QuickStartCatalogEmptyState,
  QUICKSTART_SEARCH_FILTER_KEY,
  QuickStartCatalogFilterSearchWrapper,
  QuickStartCatalogFilterCountWrapper,
  QuickStartCatalog,
  QuickStartCatalogSection,
  QuickStartCatalogHeader,
  QuickStartCatalogToolbar,
  QuickStartCatalogPage,
  LoadingBox,
} from "@patternfly/quickstarts";
import { GuidesQuickStart } from "./procedure-parser";
import { DemoContext } from "./index";
import "./Catalog.css";

const MasQuickStartCatalog: React.FC = () => {
  const { quickStarts, loading } = useContext(DemoContext);
  const { activeQuickStartID, allQuickStartStates } =
    React.useContext<QuickStartContextValues>(QuickStartContext);

  const initialQueryParams = new URLSearchParams(window.location.search);
  const initialSearchQuery =
    initialQueryParams.get(QUICKSTART_SEARCH_FILTER_KEY) || "";

  const sortFnc = (q1: GuidesQuickStart, q2: GuidesQuickStart) => {
    const q1Order = q1.metadata.annotations?.order;
    const q2Order = q2.metadata.annotations?.order;
    if (q1Order && !q2Order) {
      return -1;
    } else if (!q1Order && q2Order) {
      return 1;
    } else if (!q1Order && !q2Order) {
      return q1.spec.displayName.localeCompare(q2.spec.displayName);
    } else if (q1Order && q2Order) {
      return q1Order - q2Order;
    }
    return 0;
  };

  const initialFilteredQuickStarts = filterQuickStarts(
    quickStarts,
    initialSearchQuery,
    [],
    allQuickStartStates
  ).sort(sortFnc);

  const [filteredQuickStarts, setFilteredQuickStarts] = React.useState<
    GuidesQuickStart[]
  >(initialFilteredQuickStarts);

  React.useEffect(() => {
    if (quickStarts !== filteredQuickStarts) {
      setFilteredQuickStarts(quickStarts);
    }
  }, [quickStarts, setFilteredQuickStarts]);

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
      <QuickStartCatalogSection>
        <TextContent>
          <Text component="h2">Hello world! Quick starts</Text>
          <Text component="p" className="mk-catalog-sub">
            Step-by-step instructions and tasks
          </Text>
        </TextContent>
        <Gallery className="pfext-quick-start-catalog__gallery" hasGutter>
          {quickStarts
            .filter(
              (quickStart) =>
                !quickStart.spec.type ||
                quickStart.spec.type.text !== "Documentation"
            )
            .sort(sortFnc)
            .map((quickStart) => {
              const {
                metadata: { name: id },
              } = quickStart;

              return (
                <GalleryItem
                  key={id}
                  className="pfext-quick-start-catalog__gallery-item"
                >
                  <QuickStartTile
                    quickStart={quickStart}
                    isActive={id === activeQuickStartID}
                    status={getQuickStartStatus(allQuickStartStates, id)}
                  />
                </GalleryItem>
              );
            })}
        </Gallery>
      </QuickStartCatalogSection>
      <QuickStartCatalogSection>
        <Divider />
      </QuickStartCatalogSection>
      <QuickStartCatalogSection>
        <TextContent>
          <Text component="h2">Documentation</Text>
          <Text component="p" className="mk-catalog-sub">
            Technical information for using the service
          </Text>
        </TextContent>
        <Gallery className="pfext-quick-start-catalog__gallery" hasGutter>
          {quickStarts
            .filter(
              (quickStart) => quickStart.spec.type?.text === "Documentation"
            )
            .sort(sortFnc)
            .map((quickStart) => {
              const {
                metadata: { name: id },
              } = quickStart;

              return (
                <GalleryItem
                  key={id}
                  className="pfext-quick-start-catalog__gallery-item"
                >
                  <QuickStartTile
                    quickStart={quickStart}
                    isActive={id === activeQuickStartID}
                    status={getQuickStartStatus(allQuickStartStates, id)}
                  />
                </GalleryItem>
              );
            })}
        </Gallery>
      </QuickStartCatalogSection>
    </>
  );

  const clearFilters = () => {
    setFilteredQuickStarts(quickStarts.sort(sortFnc));
  };

  if (loading) {
    return <LoadingBox />;
  }

  return (
    <>
      <QuickStartCatalogHeader title="Resources" />
      <Divider component="div" />
      <QuickStartCatalogToolbar>
        <ToolbarContent>
          <QuickStartCatalogFilterSearchWrapper
            onSearchInputChange={onSearchInputChange}
          />
          <QuickStartCatalogFilterCountWrapper
            quickStartsCount={filteredQuickStarts.length}
          />
        </ToolbarContent>
      </QuickStartCatalogToolbar>
      <Divider component="div" />
      {filteredQuickStarts.length === 0 ? (
        <QuickStartCatalogEmptyState clearFilters={clearFilters} />
      ) : filteredQuickStarts.length !== quickStarts.length ? (
        <QuickStartCatalog quickStarts={filteredQuickStarts} />
      ) : (
        CatalogWithSections
      )}
    </>
  );
};

const QuickStartCatalogFederated: FunctionComponent = () => (
  <MasQuickStartCatalog />
);
// const QuickStartCatalogFederated: FunctionComponent = () => (
//   <>
//   <div>Catalog</div>
//   <QuickStartCatalogPage
//       showFilter
//       title="Quick starts"
//       hint="Learn how to create, import, and run applications with step-by-step instructions and tasks."
//     />
//     </>
// );

export default QuickStartCatalogFederated;