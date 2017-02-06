import React from 'react'
import { Link } from 'react-router'
import { Nav, Navbar, NavItem, Header, Brand } from 'react-bootstrap'

export default class HeaderComponent extends React.Component {

	constructor() {
		super();
		this.state = {
			authenticated: false
		}
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
	}

	login() {
		// TODO: Autentikointi...
		this.setState({authenticated: true});
	}

	logout() {
		this.setState({authenticated: false});
	}

	/*function requireAuth(nextState, replace) {
	  if (!auth.loggedIn()) {
	    replace({
	      pathname: '/login',
	      state: { nextPathname: nextState.location.pathname }
	    })
	  }
	}*/

	render() {
		return (
			<Navbar>
				<Navbar.Header>
				<Navbar.Brand>
					<Link to='/'>Feeder</Link>
				</Navbar.Brand>
				</Navbar.Header>
				<Nav>
					<NavItem><Link to='/'>Koti</Link></NavItem>
					<NavItem><Link to='aikataulu'>Aikataulu</Link></NavItem>
					<NavItem><Link to='logout'>Kirjaudu ulos</Link></NavItem>
				</Nav>
			</Navbar>
		);
	}

}