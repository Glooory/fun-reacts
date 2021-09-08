import React, { FC, ReactNode } from 'react';
import { Location } from '../history';
import { pathToRegexp, match } from 'path-to-regexp';
import RouterContext from './RouterContext';

export interface SwitchProps {
  location?: Location;
}

const Switch: FC<SwitchProps> = ({ location, children }) => {
  return (
    <RouterContext.Consumer>
      { value => {
        const childrenNodes = Array.isArray(children) ? children : [children];
        const history = value?.history!;
        const locationValue = location || history.location;

        let matchedChild: ReactNode | null = null;
        let computedMatch: any = null;
        childrenNodes.forEach(child => {
          if (matchedChild) return;
          const path = (child as any).props.path || '';
          const regexp = pathToRegexp(path);
          const pathname = locationValue.pathname;
          const matched = regexp.exec(pathname);
          if (matched != null) {
            matchedChild = child;
            computedMatch = match(path, { decode: decodeURIComponent })(pathname);
          }
        })

        return (<RouterContext.Provider value={{
          history,
          location: locationValue,
          match: computedMatch
        }}>
          {matchedChild}
        </RouterContext.Provider>)
      }}
    </RouterContext.Consumer>
  )
}

export default Switch;
