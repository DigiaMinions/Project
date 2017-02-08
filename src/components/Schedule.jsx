import React from 'react'
import { Button, Panel } from 'react-bootstrap'
import CreateScheduleComponent from './CreateScheduleComponent.jsx'
import ScheduleListComponent from './ScheduleListComponent.jsx'
import 'whatwg-fetch'

// Mock aikataulut, haetaan laitteelta...
const schedulesFor123 = [ {id: 1, time: "10:00", rep: 1, isActive: true}, {id: 2, time: "11:00", rep: 1, isActive: true} ];
const schedulesFor456 = [ {id: 3, time: "12:00", rep: 1, isActive: false}, {id: 4, time: "13:00", rep: 1, isActive: true}, {id: 5, time: "14:00", rep: 1, isActive: true} ];

export default class Schedule extends React.Component {

	constructor(props) {
		super(props);
		this.sendSchedulesToDevice = this.sendSchedulesToDevice.bind(this)
		this.getSchedulesForDevice = this.getSchedulesForDevice.bind(this);
		var activeDeviceSchedules = this.getSchedulesForDevice(this.props.activeDeviceVal);
		this.state = { schedules: activeDeviceSchedules };
	}

	render() {
		return (
			<div>
				<div className="well">
					<h2>Ruokinta aikataulu</h2><br />
					<CreateScheduleComponent createSchedule={this.createSchedule.bind(this)} /><br />
					<ScheduleListComponent schedules={this.state.schedules} toggleSchedule={this.toggleSchedule.bind(this)} deleteSchedule={this.deleteSchedule.bind(this)} /><br />
					<button type="button" className="button button-block" onClick={this.sendSchedulesToDevice}>Tallenna</button>
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

	sendSchedulesToDevice() {
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
			mac: this.props.activeDeviceVal,
			schedule: this.state.schedules
		})
		})
		.then(function(res) {
			console.log("Success: ", res);
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	// Aktiivinen laite vaihtuu -> haetaan uusi aikataulu
	componentWillReceiveProps(nextProps) {
		var activeDeviceSchedules = this.getSchedulesForDevice(nextProps.activeDeviceVal);
		this.setState({ schedules: activeDeviceSchedules });
	}

	// Haetaan laitteelta aikataulut
	getSchedulesForDevice(device) {
		fetch('/device/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: device
		})
		})
		.then(function(res) {
			return res.json().then(function(json) {
				console.log(JSON.stringify(json));
			})
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});


		// MOCK DATA
		if (device == 123) {
			return schedulesFor123;
		}
		else if (device == 456) {
			return schedulesFor456;
		}
	}

}
