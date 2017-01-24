import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'
import HeaderComponent from './HeaderComponent.jsx'
import CalendarComponent from './CalendarComponent.jsx'
import { Grid, Row, Col, Button, Panel } from 'react-bootstrap'
import AWSMqtt from 'aws-mqtt-client'
import credentials from 'json-loader!../../credentials.json'

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: '', startTime: new Date().getTime()-86400000, endTime: new Date().getTime() } // Past 24 hours
		this.onDeviceChange = this.onDeviceChange.bind(this)
		this.onStartTimeChange = this.onStartTimeChange.bind(this)
		this.onEndTimeChange = this.onEndTimeChange.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
		this.mqttClient = new AWSMqtt({
    	accessKeyId: credentials.accessKeyId,
    	secretAccessKey: credentials.secretAccessKey,
    	endpointAddress: credentials.endpointAddress,
    	region: credentials.region
		});
	}

	onDeviceChange (activeDevice) { 
  	this.setState({ activeDevice }) 
  }

  onStartTimeChange (time) {
  	this.setState({ startTime: time})
  }

  onEndTimeChange (time) {
  	this.setState({ endTime: time})
  }

	onButtonPress () { 
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
	  					<DevicesComponent onUpdate={this.onDeviceChange} />
		  			</Col>
		  			<Col xs={12} md={9}>
		  				<br />
		  				<Button onClick={this.onButtonPress} bsStyle="primary">Pötyä pöytään!</Button>
		  				<GraphComponent activeDevice={this.state.activeDevice} startTime={this.state.startTime} endTime={this.state.endTime} />
		  				<Panel header="Näytä ruokailu ajalta">
		  				<CalendarComponent onUpdate={this.onStartTimeChange} labelText="Mistä:" />
		  				<CalendarComponent onUpdate={this.onEndTimeChange} labelText="Mihin:" />
		  				</Panel>
		  			</Col>
		  		</Row>
		  	</Grid>
  		</div>
		);
  }

}
