import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import HeaderComponent from './HeaderComponent.jsx';
import { Grid, Row, Col, Button, Alert } from 'react-bootstrap';
import { device } from 'aws-iot-device-sdk';



export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: '' }
		this.onUpdate = this.onUpdate.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
		this.myDevice = device({
   		keyPath: '../../certs/DogFeeder.private.key',
  		certPath: '../../certs/DogFeeder.cert.pem',
    	caPath: '../../certs/root-CA.crt',
    	clientId: 'Test',
   		region: 'eu-west-1'
		});
	}

	onUpdate (activeDevice) { 
  	this.setState({ activeDevice }) 
  }

	onButtonPress () { 
  	console.log("Ruokaa kuppiin!");
		this.myDevice
	  	.on('connect', function() {
	    	console.log('connect');
	    	device.subscribe('topic_1');
	    	device.publish('topic_2', JSON.stringify({ MAC: String(this.state.activeDevice.value) }));
	    });

		this.myDevice
	  	.on('message', function(topic, payload) {
	    console.log('message', topic, payload.toString());
	  });
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
