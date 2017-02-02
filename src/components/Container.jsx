import React from 'react'
import HeaderComponent from './HeaderComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import { Col, Grid, Row } from 'react-bootstrap'

export default class Container extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: ''}
		this.onDeviceChange = this.onDeviceChange.bind(this)
	}

	onDeviceChange (activeDevice) {
		this.setState({ activeDevice })
	}

	render() {
		const activeDevice = this.state.activeDevice.value;
		return (
			<div>
				<HeaderComponent />
				<Grid>
					<Row>
						<Col xs={12} md={3}>
							<DevicesComponent onUpdate={this.onDeviceChange} />
						</Col>
						<Col xs={12} md={9}>
							{React.cloneElement(this.props.children, { activeDevice })}
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}

}
