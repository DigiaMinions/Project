import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import HeaderComponent from './HeaderComponent.jsx';
import { Grid, Row, Col, Button, Alert } from 'react-bootstrap';
const deviceModule = require('../../node_modules/aws-iot-device-sdk/index.js').device;

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: '' }
		this.onUpdate = this.onUpdate.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
	}

	onUpdate (activeDevice) { 
  	this.setState({ activeDevice }) 
  }

	onButtonPress () { 
  	console.log("Ruokaa kuppiin!");
  	var device = deviceModule({
   		keyPath: '/home/ec2-user/DogFeeder.private.key',
  		certPath: '/home/ec2-user/DogFeeder.cert.pem',
    	caPath: '/home/ec2-user/root-CA.crt',
    	host: 'axqdhi517toju.iot.eu-west-1.amazonaws.com'
		});

		device
	  	.on('connect', function() {
	    	console.log('connect');
	    	device.subscribe('topic_1');
	    	device.publish('topic_2', JSON.stringify({ MAC: this.state.activeDevice.value }));
	    });

		device
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
