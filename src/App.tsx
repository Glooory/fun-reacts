import React from 'react';
import { Router, BrowserRouter, Switch, Route, RouterProps } from 'react-router-dom';
// import { createBrowserHistory } from 'history';
import Home from './pages/Home';
import { createBrowserHistory } from '../packages/history';
import HeroList from './pages/HeroList';
import HeroDetail from './pages/HeroDetail';

const history = createBrowserHistory();

const App = () => {
  return (
    // @ts-ignore
    <Router history={history}>
      <Switch>
        <Route path="/hero/:heroId" exact component={HeroDetail} />
        <Route path="/heroes" exact component={HeroList} />
        <Route path="/" exact component={Home} />
      </Switch>
    </Router>
  )
}

export default App;
