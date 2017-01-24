import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import HeaderComponent from './HeaderComponent.jsx'
import { Grid, Row, Col, Button, Alert } from 'react-bootstrap'
import AWSMqtt from 'aws-mqtt-client'
import credentials from 'json-loader!../../credentials.json'

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: '' }
		this.onUpdate = this.onUpdate.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
		this.mqttClient = new AWSMqtt({
    	accessKeyId: credentials.accessKeyId,
    	secretAccessKey: credentials.secretAccessKey,
    	endpointAddress: credentials.endpointAddress,
    	region: credentials.region
		});
	}

	onUpdate (activeDevice) { 
  		this.setState({ activeDevice }) 
  }

	onButtonPress () { 
  	console.log("Ruokaa kuppiin!");
	  //this.mqttClient.publish('topic', JSON.stringify({ MAC: String(this.state.activeDevice.value) }));
	  var macParsed = String(this.state.activeDevice.value).replace(/%3A/g, ":");
	  this.mqttClient.publish('DogFeeder/' + macParsed, JSON.stringify({ foodfeed: 'instant' }));
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
