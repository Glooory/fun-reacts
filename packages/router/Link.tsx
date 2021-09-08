import React, { FC, ReactNode, useCallback, useContext } from 'react';
import { useHistory } from './hooks';

export interface LinkProps {
  to: string;
}

const Link: FC<LinkProps> = ({ to, children }) => {
  const history = useHistory();

  const onLinkClick = useCallback((e) => {
    e.preventDefault();
    history.push(to);
  }, [to, history]);

  return <a href={to} onClick={onLinkClick}>{children}</a>
}

export default Link;
