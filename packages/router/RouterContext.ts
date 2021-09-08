import { createContext } from 'react';
import { BrowserHistory as History, Location } from '../history';

export interface RouterContextType {
  history: History;
  location: Location;
  match: any;
}

const RouterContext = createContext<RouterContextType>({} as RouterContextType);

RouterContext.displayName = 'RouterContext';

export default RouterContext;
