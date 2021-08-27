import React from 'react';
import { Router, BrowserRouter, Switch, Route, RouterProps } from 'react-router-dom';
import Home from './pages/Home';
import { createBrowserHistory } from '../packages/history';
import HeroList from './pages/HeroList';
import HeroDetail from './pages/HeroDetail';

const routerProps: RouterProps = {
  history: createBrowserHistory(),
}

const App = () => {
  return (
    <Router {...routerProps}>
      <Switch>
        <Route path="/hero/:heroId" exact component={HeroDetail} />
        <Route path="/heroes" exact component={HeroList} />
        <Route path="/" exact component={Home} />
      </Switch>
    </Router>
  )
}

export default App;
