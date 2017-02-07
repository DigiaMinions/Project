import React from 'react'
import { Link } from 'react-router'

export default class AuthPage extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {		
		return (
			<div className="form">
				<div>			
					<ul role="nav" className="tab-group">
					  <li><Link to="/signup" activeStyle={{ background: '#1ab188', color: '#ffffff' }}>Rekisteröidy</Link></li>
					  <li><Link to="/login" activeStyle={{ background: '#1ab188', color: '#ffffff' }}>Kirjaudu</Link></li>
					</ul>
				</div>			

				{this.props.children}
			
			</div>
		);
	}
}