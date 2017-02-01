import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import App from './components/App.jsx'
import Container from './components/Container.jsx'
import Schedule from './components/Schedule.jsx'
import NotFound from './components/NotFound.jsx'

render(
	<Router history={browserHistory}>
		<Route path='/' component={Container}>
			<IndexRoute component={App} />
			<Route path='aikataulu' component={Schedule} />
			<Route path='*' component={NotFound} />
		</Route>  
	</Router>,
	document.getElementById('app')
);