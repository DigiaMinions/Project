import React from 'react'
import HeaderComponent from './HeaderComponent.jsx'
import { Grid, Row } from 'react-bootstrap'

export default class Container extends React.Component {

	render() {
		return (
			<div>
				<HeaderComponent />
				<Grid>
					<Row>
					{this.props.children}
					</Row>
				</Grid>
			</div>
		);
	}

}
