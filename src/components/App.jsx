import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import HeaderComponent from './HeaderComponent.jsx'
import { Grid, Row, Col, Button, Alert } from 'react-bootstrap'
import AWSMqtt from 'aws-mqtt-client'

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: '' }
		this.onUpdate = this.onUpdate.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
		this.mqttClient = new AWSMqtt({
    	accessKeyId: 'AKIAIBAYUIONI6MUNO6Q',
    	secretAccessKey: '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',
    	endpointAddress: 'axqdhi517toju.iot.eu-west-1.amazonaws.com',
    	region: 'eu-west-1'
		});
	}

	onUpdate (activeDevice) { 
  		this.setState({ activeDevice }) 
  }

	onButtonPress () { 
  	console.log("Ruokaa kuppiin!");
	  this.mqttClient.publish('topic', JSON.stringify({ MAC: String(this.state.activeDevice.value) }));
  }

  render() {
    return (
	  	<div>
	  		<HeaderComponent />
	  		<Grid>
	  			<Row>
	  				<Col xs={12} md={3}>
	  					<DevicesComponent onUpdate={this.onUpdate} />
		  			</Col>
		  			<Col xs={12} md={9}>
		  				<br />
		  				<Button onClick={this.onButtonPress} bsStyle="primary">Pötyä pöytään!</Button>
		  				<GraphComponent activeDevice={this.state.activeDevice} />
		  			</Col>
		  		</Row>
		  	</Grid>
  		</div>
		);
  }

}
