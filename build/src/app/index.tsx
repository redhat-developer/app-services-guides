import * as React from 'react';
import "@patternfly/patternfly/base/patternfly-shield-inheritable.css";
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import QuickStartDrawerFederated from './QuickStartDrawerFederated';
import DemoPage from './DemoPage';

const App = () => (
  <QuickStartDrawerFederated>
    {/* @ts-ignore */}
    <DemoPage />
  </QuickStartDrawerFederated>
);

export { App };
