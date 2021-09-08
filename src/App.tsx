import React from 'react';
// import { BrowserRouter, Switch, Route, RouterProps } from 'react-router-dom';
// import { createBrowserHistory } from 'history';
import Home from './pages/Home';
import { createBrowserHistory } from '../packages/history';
import HeroList from './pages/HeroList';
import HeroBase from './pages/HeroBase';
import HeroDetail from './pages/HeroDetail';
import { History } from 'history';
import Router from '../packages/router/Router';
import Route from './../packages/router/Route';
import Switch from '../packages/router/Switch';

const history = createBrowserHistory();

const App = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/hero/:heroId" exact component={HeroDetail} />
        <Route path="/heroes" exact component={HeroList} />
        <Route path="/base" exact component={HeroBase} />
        <Route path="/" exact component={Home} />
        <h2>404</h2>
      </Switch>
    </Router>
  )
}

export default App;
