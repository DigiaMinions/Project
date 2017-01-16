import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/MasterPage';
import IndexPage from './components/IndexPage';
import NotFoundPage from './components/NotFoundPage';

const routes = (
  <Route path="/" component={MasterPage}>
    <IndexRoute component={IndexPage}/>
	<Route path="*" component={NotFoundPage}/>
  </Route>
);

export default routes;