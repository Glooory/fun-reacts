import { createContext } from 'react';
import { History } from '../history';

const HistoryContext = createContext<History>({} as History);

HistoryContext.displayName = 'HistoryContext';

export default HistoryContext;
