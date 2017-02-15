import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import CalendarComponent from './CalendarComponent.jsx'
import { Button, Panel, Col, Row } from 'react-bootstrap'
import 'whatwg-fetch'

export default class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDeviceVal: this.props.activeDeviceVal, startTime: new Date().getTime()-86400000, endTime: new Date().getTime() } // Oletuksena näyttää viim. 24h
		this.onStartTimeChange = this.onStartTimeChange.bind(this)
		this.onEndTimeChange = this.onEndTimeChange.bind(this)
		this.onFeedButtonPress = this.onFeedButtonPress.bind(this)
		this.onCalibrateButtonPress = this.onCalibrateButtonPress.bind(this)
	}

	onStartTimeChange(time) {
		this.setState({ startTime: new Date(time).getTime()})
	}

	onEndTimeChange(time) {
		this.setState({ endTime: new Date(time).getTime()})
	}

	onFeedButtonPress() {
		// API kutsu Fetchillä
		fetch('/feed/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.props.activeDeviceVal
		})
		})
		.then(function(res) {
			console.log("Success: ", res);
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	onCalibrateButtonPress() {
		fetch('/calibrate/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.props.activeDeviceVal
		})
		})
		.then(function(res) {
			console.log("Success: ", res);
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}


	render() {
		return (
			<div>
				<br />
				<Row>
					<Col xs={6}><button type="button" onClick={this.onFeedButtonPress} className="button button-block">Pötyä pöytään!</button></Col>
					<Col xs={6}><button type="button" onClick={this.onCalibrateButtonPress} className="button button-block">Kalibroi anturi</button></Col>
				</Row>
				<GraphComponent activeDeviceVal={this.props.activeDeviceVal} startTime={this.state.startTime} endTime={this.state.endTime} />
				<Panel header="Näytä ruokailu ajalta">
				<Col xs={6} md={4}>
					<strong>Mistä:</strong><CalendarComponent onUpdate={this.onStartTimeChange} labelText="Mistä:" />
				</Col>
				<Col xs={6} md={4}>
					<strong>Mihin:</strong><CalendarComponent onUpdate={this.onEndTimeChange} labelText="Mihin:" />
				</Col>
				</Panel>
			</div>
		);
	}

}
