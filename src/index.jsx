import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import App from './components/App.jsx'
import Home from './components/Home.jsx'
import Schedule from './components/Schedule.jsx'
import NotFound from './components/NotFound.jsx'
import AuthPage from './components/AuthPage.jsx'
import LoginForm from './components/LoginForm.jsx'
import SignUpForm from './components/SignUpForm.jsx'

render(
	(
	<Router history={browserHistory}>
		<Route path='/' component={App} >
			<IndexRoute component={Home} />
			<Route path='aikataulu' component={Schedule} />
		</Route>
		<Route path='/auth' component={AuthPage}>
			<Route path='/logout' component={LoginForm}/>
			<Route path='/login' component={LoginForm} />
			<Route path='/signup' component={SignUpForm} />
		</Route>
		<Route path='*' component={NotFound} />
	</Router>
	), document.getElementById('app')
);