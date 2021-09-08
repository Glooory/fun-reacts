import { useContext } from 'react';
import RouterContext from './RouterContext';
import HistoryContext from './HistoryContext';
import { History } from '../history';

export const useHistory = () => {
  const historyContext = useContext<History>(HistoryContext);
  return historyContext;
}

export const useParams = <P extends object = object>(): P => {
  const routerContext = useContext(RouterContext);
  return routerContext?.match.params;
}
