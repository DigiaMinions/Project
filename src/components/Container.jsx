import React from 'react'
import HeaderComponent from './HeaderComponent.jsx'

export default class Container extends React.Component {

	constructor(props) {		
		super(props);
	}

	render() {
		return (
			<div>
				<HeaderComponent />
				<div>
					{this.props.children}
				</div>
			</div>
		);
	}

}

