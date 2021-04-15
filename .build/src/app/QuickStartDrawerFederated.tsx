import React, { useState, useEffect, FunctionComponent } from "react";
import ReactDOM from "react-dom";
import {
  QuickStartContext,
  QuickStartDrawer,
  useLocalStorage,
  useValuesForQuickStartContext,
} from "@cloudmosaic/quickstarts";
import { loadJSONQuickStarts } from "@app/quickstartLoader";
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";
import "@cloudmosaic/quickstarts/dist/quickstarts.css";

const getElement = (node: HTMLElement | (() => HTMLElement)) => {
  if (typeof node === "function") {
    return node();
  }
  return node;
};

export interface QuickStartDrawerFederatedProps
  extends React.HTMLProps<HTMLDivElement> {
  basePath?: string;
  showDrafts?: boolean;
  appendTo?: HTMLElement | (() => HTMLElement);
  root?: HTMLElement | (() => HTMLElement);
}

const QuickStartDrawerFederated: FunctionComponent<QuickStartDrawerFederatedProps> = ({
  children,
  basePath,
  showDrafts,
  appendTo,
  root,
  ...props
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

  useEffect(() => {
    const load = async () => {
      const quickstarts = await loadJSONQuickStarts(basePath || "", showDrafts);
      console.log(quickstarts);
      setAllQuickStarts(quickstarts);
      setAllQuickStartsLoaded(true);
    };
    load();
  }, [basePath, showDrafts]);

  useEffect(() => {
    if (root) {
      if (activeQuickStartID) {
        getElement(root).classList.add('pf-m-expanded');
      } else {
        getElement(root).classList.remove('pf-m-expanded');
      }
    }
  }, [root, activeQuickStartID]);

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
        <QuickStartDrawer appendTo={appendTo} {...props}>{children}</QuickStartDrawer>
      </QuickStartContext.Provider>
    );
  } else {
    return <></>;
  }
};

export default QuickStartDrawerFederated;
