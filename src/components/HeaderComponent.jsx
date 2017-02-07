import React from 'react'
import { Link } from 'react-router'
import { Nav, Navbar, NavItem, Header, Brand } from 'react-bootstrap'

export default class HeaderComponent extends React.Component {

	logout() {
		fetch('/logout', {
			credentials: 'same-origin',
			method: 'GET'
		})
		.then(function(res) {
			console.log("Successia puskee: ", res);
			window.location.href = '/login';
		})
		.catch(function(err) {
			console.log("Erroria puskee: ", err);
		});

	}

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
					<NavItem><Link onClick={() => this.logout()}>Kirjaudu ulos</Link></NavItem>
				</Nav>
			</Navbar>
		);
	}

}