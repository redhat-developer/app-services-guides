import React, { useState, useEffect, FunctionComponent } from "react";
import {
  QuickStartContainer as PfQuickStartContainer,
  useLocalStorage,
} from "@patternfly/quickstarts";
import { loadJSONQuickStarts } from "@app/quickstartLoader";
import {useAssets} from "@rhoas/app-services-ui-shared";

export interface QuickStartContainerProps
  extends React.HTMLProps<HTMLDivElement> {
  showDrafts?: boolean;
}

const QuickStartContainer: FunctionComponent<QuickStartContainerProps> = ({
  children,
  showDrafts
}) => {
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

  const assets = useAssets();

  useEffect(() => {
    const load = async () => {
      const quickstarts = await loadJSONQuickStarts(assets?.getPath() || "", showDrafts);
      console.log(quickstarts);
      setAllQuickStarts(quickstarts);
      setAllQuickStartsLoaded(true);
    };
    load();
  }, [assets, showDrafts]);

  const drawerProps = {
    quickStarts: allQuickStarts,
    activeQuickStartID,
    allQuickStartStates,
    setActiveQuickStartID,
    setAllQuickStartStates,
    showCardFooters: false,
    language: 'en',
    loading: allQuickStartsLoaded,
  };

  return (
    <PfQuickStartContainer {...drawerProps}>
      {children}
    </PfQuickStartContainer>
  );
};

export default QuickStartContainer;