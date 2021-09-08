import React, { useState, useEffect, FC } from 'react';
import { BrowserHistory as History, Location } from '../history';
import RouterContext from './RouterContext';
import HistoryContext from './HistoryContext';

export interface RouterProps {
  history: History;
}

const Router: FC<RouterProps> = ({ history, children }) => {
  const [location, setLocation] = useState<Location>(history.location);

  useEffect(() => {
    const listener = ({ location }: { location: Location }) => {
      setLocation(location);
    }

    const unlisten = history.listen(listener);

    return () => {
      unlisten && unlisten();
    }
  }, [history]);

  return (
    <RouterContext.Provider value={{
      location,
      history,
      match: { path: '/',}
    }}>
      <HistoryContext.Provider value={history}>
        {children}
      </HistoryContext.Provider>
    </RouterContext.Provider>
  )
}

export default Router;
