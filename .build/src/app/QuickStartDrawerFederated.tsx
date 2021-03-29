import React, {useState, useEffect, FunctionComponent} from "react";
import {
  QuickStartContext,
  QuickStartDrawer,
  useLocalStorage,
  useValuesForQuickStartContext,
} from "@cloudmosaic/quickstarts";
import {loadJSONQuickStarts} from "@app/quickstartLoader";
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";
import "@cloudmosaic/quickstarts/dist/quickstarts.css";

export interface QuickStartDrawerFederatedProps extends React.HTMLProps<HTMLDivElement> {
  basePath?: string
}

const QuickStartDrawerFederated: FunctionComponent<QuickStartDrawerFederatedProps> = ({ children, basePath, ...props }) => {
  const [activeQuickStartID, setActiveQuickStartID] = useLocalStorage(
    "quickstartId",
    ""
  );
  const [allQuickStartStates, setAllQuickStartStates] = useLocalStorage(
    "quickstarts",
    {}
  );

  const [allQuickStartsLoaded, setAllQuickStartsLoaded] = useState<boolean>(false);
  const [allQuickStarts, setAllQuickStarts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const quickstarts = await loadJSONQuickStarts(basePath || "")
      setAllQuickStarts(quickstarts);
      setAllQuickStartsLoaded(true);
    }
    load();

  }, []);

  const valuesForQuickstartContext = useValuesForQuickStartContext({
    activeQuickStartID,
    setActiveQuickStartID,
    allQuickStartStates,
    setAllQuickStartStates,
    allQuickStarts,
  });
  if (allQuickStartsLoaded) {
    return (
        <QuickStartContext.Provider value={valuesForQuickstartContext}>
          <QuickStartDrawer {...props}>{children}</QuickStartDrawer>
        </QuickStartContext.Provider>
    );
  } else {
    return <></>;
  }

};

export default QuickStartDrawerFederated;
