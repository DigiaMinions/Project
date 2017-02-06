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
				      <li className="tab"><Link to="/signup">Sign up</Link></li>
				      <li className="tab"><Link to="/login">Log In</Link></li>
				    </ul>
				</div>			

				{this.props.children}
			
			</div>
		);
	}
}