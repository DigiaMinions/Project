import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import CalendarComponent from './CalendarComponent.jsx'
import { Button, Panel } from 'react-bootstrap'
import 'whatwg-fetch'

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: this.props.activeDevice, startTime: new Date().getTime()-86400000, endTime: new Date().getTime() } // Oletuksena näyttää viim. 24h
		this.onStartTimeChange = this.onStartTimeChange.bind(this)
		this.onEndTimeChange = this.onEndTimeChange.bind(this)
		this.onButtonPress = this.onButtonPress.bind(this)
	}

	onStartTimeChange (time) {
		this.setState({ startTime: time})
	}

	onEndTimeChange (time) {
		this.setState({ endTime: time})
	}

	onButtonPress () {
		// API kutsu Fetchillä
		fetch('/feed/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.state.activeDevice
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
				<br /><Button onClick={this.onButtonPress} bsStyle="primary">Pötyä pöytään!</Button>
				<GraphComponent activeDevice={this.props.activeDevice} startTime={this.state.startTime} endTime={this.state.endTime} />
				<Panel header="Näytä ruokailu ajalta">
					<CalendarComponent onUpdate={this.onStartTimeChange} labelText="Mistä:" />
					<CalendarComponent onUpdate={this.onEndTimeChange} labelText="Mihin:" />
				</Panel>
			</div>
		);
	}

}
