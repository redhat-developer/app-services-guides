import "@patternfly/quickstarts/dist/quickstarts.min.css";

import React, { useState, useEffect, FunctionComponent } from "react";
import {
  QuickStartContextProvider,
  QuickStartDrawer,
  useLocalStorage,
  QuickStartContainer,
} from "@patternfly/quickstarts";
import { loadJSONQuickStarts } from "@app/quickstartLoader";
import {useAssets} from "@bf2/ui-shared";

const getElement = (node: HTMLElement | (() => HTMLElement)) => {
  if (typeof node === "function") {
    return node();
  }
  return node;
};

export interface QuickStartDrawerFederatedProps
  extends React.HTMLProps<HTMLDivElement> {
  showDrafts?: boolean;
  appendTo?: HTMLElement | (() => HTMLElement);
  root?: HTMLElement | (() => HTMLElement);
}

const xQuickStartDrawerFederated = ({ className, children, ...props }) => <div className={`drawer-wrapper ${className}`} {...props}>
  <div>drawer wrapper</div>
  {children}
</div>

const QuickStartDrawerFederated: FunctionComponent<QuickStartDrawerFederatedProps> = ({
  children,
  quickStarts,
  loading,
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

  useEffect(() => {
    if (root && getElement(root)) {
      if (activeQuickStartID) {
        getElement(root).classList.add('pf-m-expanded');
      } else {
        getElement(root).classList.remove('pf-m-expanded');
      }
    }
  }, [root, activeQuickStartID]);

  const drawerProps = {
    quickStarts,
    activeQuickStartID,
    allQuickStartStates,
    setActiveQuickStartID,
    setAllQuickStartStates,
    loading,
    appendTo,
  };
  debugger;

  return (
    <QuickStartContainer {...drawerProps} {...props}>{children}</QuickStartContainer>
  );
};

const xxxQuickStartDrawerFederated: FunctionComponent<QuickStartDrawerFederatedProps> = ({
  children,
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

  useEffect(() => {
    if (root && getElement(root)) {
      if (activeQuickStartID) {
        getElement(root).classList.add('pf-m-expanded');
      } else {
        getElement(root).classList.remove('pf-m-expanded');
      }
    }
  }, [root, activeQuickStartID]);

  const valuesForQuickstartContext = {
    activeQuickStartID,
    setActiveQuickStartID,
    allQuickStartStates,
    setAllQuickStartStates,
    allQuickStarts,
  };
  if (allQuickStartsLoaded) {
    return (
      <QuickStartContextProvider value={valuesForQuickstartContext}>
        <QuickStartDrawer appendTo={appendTo} {...props}>{children}</QuickStartDrawer>
      </QuickStartContextProvider>
    );
  } else {
    return children;
  }
};

export default QuickStartDrawerFederated;