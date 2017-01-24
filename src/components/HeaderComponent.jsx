import React from 'react'
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
    // TODO: Authentication here...
      this.setState({authenticated: true});
  }

  logout() {
    this.setState({authenticated: false});
  }

  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Feeder</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem onClick={this.login}>Login</NavItem>
          <NavItem onClick={this.logout}>Logout</NavItem>
        </Nav>
      </Navbar>
    );
  }
}