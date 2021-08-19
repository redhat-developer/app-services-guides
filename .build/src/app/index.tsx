import * as React from 'react';
import QuickStartDrawerFederated from './QuickStartDrawerFederated';
import QuickStartLoader from './quickstartLoader';
import DemoPage from './DemoPage';

const App = () => (
  <QuickStartDrawerFederated>
    <DemoPage />
  </QuickStartDrawerFederated>
);

export { App };
