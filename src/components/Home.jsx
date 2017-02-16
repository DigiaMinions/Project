import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import CalendarComponent from './CalendarComponent.jsx'
import { Button, Panel, Col, Row } from 'react-bootstrap'
import 'whatwg-fetch'

export default class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDeviceVal: this.props.activeDeviceVal, startTime: 'now%2Fd', endTime: 'now' } // Oletuksena näyttää tämän päivän (tähän asti)
		this.onStartTimeChange = this.onStartTimeChange.bind(this)
		this.onEndTimeChange = this.onEndTimeChange.bind(this)
		this.onFeedButtonPress = this.onFeedButtonPress.bind(this)
		this.onCalibrateButtonPress = this.onCalibrateButtonPress.bind(this)
		this.setQuickRange = this.setQuickRange.bind(this)
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

	setQuickRange(startTime, endTime) {
		this.setState({ startTime: startTime, endTime: endTime })
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
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-1h", "now")}>Viimeinen 1 tunti</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-24h", "now")}>Viimeiset 24 tuntia</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-1d%2Fd", "now-1d%2Fd")}>Eilen</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now%2Fw", "now%2Fw")}>Tällä viikolla</a><br/>
				</Col>
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
