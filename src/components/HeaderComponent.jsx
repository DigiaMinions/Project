import React from 'react'
import { Link } from 'react-router'
import { Nav, Navbar, NavItem, Header, Brand } from 'react-bootstrap'
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

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
					<IndexLinkContainer to='/'><NavItem>Koti</NavItem></IndexLinkContainer>
					<LinkContainer to='/aikataulu'><NavItem>Aikataulu</NavItem></LinkContainer>
					<LinkContainer to='/tilaus'><NavItem>Lisää laite</NavItem></LinkContainer>
					<NavItem onClick={() => this.logout()}>Kirjaudu ulos</NavItem>
				</Nav>
			</Navbar>
		);
	}

}