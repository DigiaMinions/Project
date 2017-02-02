import React from 'react'
import { Button, Panel } from 'react-bootstrap'
import CreateScheduleComponent from './CreateScheduleComponent.jsx'
import ScheduleListComponent from './ScheduleListComponent.jsx'
import 'whatwg-fetch'

const schedules = [];

export default class Schedule extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDevice: this.props.activeDevice, schedules };
	}

	render() {
		return (
			<div>
				<div className="well">
					<h2>Ruokinta aikataulu</h2><br />
					<CreateScheduleComponent schedules={this.state.schedules} createSchedule={this.createSchedule.bind(this)} /><br />
					<ScheduleListComponent schedules={this.state.schedules} toggleSchedule={this.toggleSchedule.bind(this)} deleteSchedule={this.deleteSchedule.bind(this)} /><br />
					<button type="button" className="btn btn-primary btn-lg" onClick={this.sendScheduleToDevice.bind(this)}>Lähetä aikataulu laitteelle</button>
				</div>
			</div>
		);
	}

	generateId() {
		var id = Math.floor(Math.random() * 9999);
		var foundId = _.find(this.state.schedules, schedule => schedule.id === id);
		if (foundId)
			return this.generateId();
		else
			return id;
	}

	createSchedule(time, rep) {
		var id = this.generateId();
		this.state.schedules.push({
			id,
			time,
			rep,
			isActive: true
		});
		this.setState({ schedules: this.state.schedules });
	}

	toggleSchedule(scheduleId) {
		var foundSchedule = _.find(this.state.schedules, schedule => schedule.id === scheduleId);
		foundSchedule.isActive = !foundSchedule.isActive;
		this.setState({ schedules: this.state.schedules });
	}

	deleteSchedule(scheduleId) {
		_.remove(this.state.schedules, schedule => schedule.id === scheduleId);
		this.setState({ schedules: this.state.schedules });
	}

	sendScheduleToDevice() {
		var self = this;
		self.scheduleToSend = [];
		// Lisätään aktiiviset aikataulut laitteelle lähtevään taulukkoon
		_.forEach(this.state.schedules, function(schedule) {
			if (schedule.isActive === true)
				self.scheduleToSend.push(schedule.time + "rep" + schedule.rep);
		});

		// API kutsu Fetchillä
		fetch('/schedule/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.props.activeDevice,
			schedule: self.scheduleToSend
		})
		})
		.then(function(res) {
			console.log("Success: ", res);
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}
}
