import * as React from 'react';
import QuickStartDrawerFederated from './QuickStartDrawerFederated';
import QuickStartLoader from './quickstartLoader';
import DemoPage from './DemoPage';

export const DemoContext = React.createContext({
  quickStarts: [],
  loading: true
});

const App = () => {
  const [qsState, setQsState] = React.useState({
    quickStarts: [],
    loading: true
  });
  return (
    <>
    <QuickStartDrawerFederated quickStarts={qsState.quickStarts} loading={qsState.loading}>
      <DemoPage />
    </QuickStartDrawerFederated>
    <QuickStartLoader onLoad={(qs) => setQsState({
      quickStarts: qs,
      loading: false
    })} />
    </>
  )};

export { App };
