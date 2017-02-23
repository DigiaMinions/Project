import React from 'react'
import Dropdown from 'react-dropdown'
import { Col, Grid, Row } from 'react-bootstrap'

export default class App extends React.Component {

	constructor(props) {		
		super(props);	
		this.state = { userDevices: [], activeDevice: '' };
		this.onSelect = this.onSelect.bind(this);
	}

	onSelect(option) {
		this.setState({activeDevice: option})
	}

	componentDidMount() {
		var self = this;
		fetch('/devices/', {
				credentials: 'same-origin',
				method: 'GET'
			})
			.then(function(response) {
				// jostain syystä pitää palauttaa response.json() ennen kuin tietoon pääsee käsiksi
			  return response.json();
			})
			.then(function(jsonData) {
				if(jsonData.length)
				{
					var data = '[';
					// PARSITAAN JSON UUTEEN MUOTOON. mac -> value | name -> label				
					for (var i = 0;i<jsonData.length;i++)
					{
						data += '{ "value": "' + jsonData[i].uid + '", "label": "' + jsonData[i].name + '"}';
						if (i<jsonData.length-1) {data += ","};
					}
					data += "]";
					var devices = JSON.parse(data);
					self.setState({userDevices: devices});
					self.setState({activeDevice: devices[0]});
				}
				
			})
			.catch(function(err) {
				console.log("Erroria puskee: ", err);
			});		
	}

	render() {
		return (
			<div>				
				<Grid>
					<Row>
						<Col xs={12} md={3}>
							<div>
								Valitse laite:
								<Dropdown options={this.state.userDevices} onChange={this.onSelect} placeholder={this.state.activeDevice.label} />
							</div>
						</Col>
						<Col xs={12} md={9}>
							{React.cloneElement(this.props.children, { activeDeviceVal: this.state.activeDevice.value })}
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}

}
