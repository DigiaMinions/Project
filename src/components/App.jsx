import React from 'react'
import Dropdown from 'react-dropdown'
import HeaderComponent from './HeaderComponent.jsx'
import { Col, Grid, Row } from 'react-bootstrap'

export default class App extends React.Component {

	constructor(props) {		
		super(props);
		var placeholder = [{value: '0', label: 'Valitse laite'}];
		this.state = { userDevices: [], activeDevice: placeholder[0] };
		this.onSelect = this.onSelect.bind(this);
	}

	onSelect (option) {
		this.setState({activeDevice: option})
	}

	componentDidMount(){	
		var that = this;
		fetch('/devices', {
				credentials: 'same-origin',
				method: 'GET'
			})
			.then(function(response) {
				// jostain syystä pitää palauttaa response.json() ennen kuin tietoon pääsee käsiksi
			  return response.json();
			})
			.then(function(jsonData) {
				var data = '[';
				// PARSITAAN JSON UUTEEN MUOTOON. mac -> value | name -> label				
				for (var i = 0;i<jsonData.length;i++)
				{
					data += '{ "value": "' + jsonData[i].mac + '", "label": "' + jsonData[i].name + '"}';
					if (i<jsonData.length-1) {data += ","};
				}
				data += "]";

				var devices = JSON.parse(data);
				that.setState({userDevices: devices});
				that.setState({activeDevice: devices[0]});
			})
			.catch(function(err) {
				console.log("Erroria puskee: ", err);
			});		
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
								<Dropdown options={this.state.userDevices} onChange={this.onSelect} value={this.state.activeDevice} placeholder="Valitse laite" />
							</div>
						</Col>
						<Col xs={12} md={9}>
							{React.cloneElement(this.props.children, { activeDeviceVal: activeDeviceVal })}
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}

}
