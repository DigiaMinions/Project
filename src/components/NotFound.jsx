import React from 'react'
import { Col } from 'react-bootstrap'

export default class NotFound extends React.Component {

	render() {
		return (
			<div>
				<Col xs={12}>
					<h2>404</h2>
					<h3>Täällä ei ole mitään...</h3>
				</Col>
			</div>
		);
	}

}
