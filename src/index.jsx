
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import App from './components/App.jsx'
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Container from './components/Container.jsx'
import Schedule from './components/Schedule.jsx'
import NotFound from './components/NotFound.jsx'
import Login from './components/Login.jsx'

render(
	<Router history={browserHistory}>				
		<Route path='/login' component={Login} />
		<Route path='/' component={Container} >
			<IndexRoute component={App} />
			<Route path='aikataulu' component={Schedule} />	
		</Route>		
		<Route path='*' component={NotFound} />	
	</Router>,
	document.getElementById('app')
);