import * as React from 'react';
import QuickStartDrawerFederated from './QuickStartDrawerFederated';
import QuickStartLoader from './quickstartLoader';
import DemoPage from './DemoPage';

export const DemoContext = React.createContext({
  quickStarts: [],
  loading: true
});

const App = () => {
  const [context, setContext] = React.useState({
    quickStarts: [],
    loading: true
  });
  return (
    <DemoContext.Provider value={context}>
      <QuickStartDrawerFederated>
        <DemoPage />
      </QuickStartDrawerFederated>
      <QuickStartLoader onLoad={(qs) => setContext({
        quickStarts: qs,
        loading: false
      })} />
    </DemoContext.Provider>
  )};

export { App };
