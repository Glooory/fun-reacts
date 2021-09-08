import React, { FC } from 'react';

export interface RouteProps {
  path: string;
  component: FC;
  exact?: boolean;
  match?: any;
}

const Route = ({ path, component, match, exact = false, ...props }: RouteProps) => {
  return component(props);
}

export default Route;


