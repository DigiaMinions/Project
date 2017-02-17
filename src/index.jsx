import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import Container from './components/Container.jsx'
import App from './components/App.jsx'
import Home from './components/Home.jsx'
import Schedule from './components/Schedule.jsx'
import OrderForm from './components/OrderForm.jsx'
import NotFound from './components/NotFound.jsx'
import AuthPage from './components/AuthPage.jsx'
import LoginForm from './components/LoginForm.jsx'
import SignUpForm from './components/SignUpForm.jsx'


//http://stackoverflow.com/questions/35687353/react-bootstrap-link-item-in-a-navitem

render(
	(
	<Router history={browserHistory}>
		<Route path='/auth' component={AuthPage}>
			<Route path='/logout' component={LoginForm}/>
			<Route path='/login' component={LoginForm} />
			<Route path='/signup' component={SignUpForm} />
		</Route>
		<Route component={Container}>
			<Route path='/tilaus' component={OrderForm} />
			<Route path='/' component={App} >
				<IndexRoute component={Home} />
				<Route path='aikataulu' component={Schedule} />			
			</Route>			
			
		</Route>
		<Route path='*' component={NotFound} />
	</Router>
	), document.getElementById('app')
);