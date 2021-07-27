import * as React from 'react';
import QuickStartDrawerFederated from './QuickStartDrawerFederated';
import DemoPage from './DemoPage';

const App = () => (
  <QuickStartDrawerFederated>
    <div>Some content that should be visible even before the quick starts are loaded</div>
    <DemoPage />
  </QuickStartDrawerFederated>
);

export { App };
