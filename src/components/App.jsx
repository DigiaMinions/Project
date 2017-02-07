import React from 'react'
import Dropdown from 'react-dropdown'
import HeaderComponent from './HeaderComponent.jsx'
import { Col, Grid, Row } from 'react-bootstrap'

const userDevices = [
	{ value: '123', label: 'Monnin masiina' },
	{ value: '456', label: 'Raksu kone' } // TODO: Kirjautuneen käyttäjän MACit kannasta... (: enkoodataan %3A)
]

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: userDevices[0] }
		this.onSelect = this.onSelect.bind(this)
	}

	onSelect (option) {
		this.setState({activeDevice: option})
	}

	render() {
		const activeDevice = this.state.activeDevice;
		const activeDeviceVal = activeDevice.value;

		return (
			<div>
				<HeaderComponent />
				<Grid>
					<Row>
						<Col xs={12} md={3}>
							<div>
								Valitse laite:
								<Dropdown options={userDevices} onChange={this.onSelect} value={activeDevice} placeholder="Valitse laite" />
							</div>
						</Col>
						<Col xs={12} md={9}>
							{React.cloneElement(this.props.children, { activeDeviceVal })}
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}

}
