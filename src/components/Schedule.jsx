import React from 'react'
import CreateScheduleComponent from './CreateScheduleComponent.jsx'
import ScheduleListComponent from './ScheduleListComponent.jsx'
import ModalComponent from './ModalComponent.jsx'
import _ from 'lodash'
import 'whatwg-fetch'

export default class Schedule extends React.Component {

	constructor(props) {
		super(props);
		this.state = { schedules: [], saveState: '' };
		this.sendSchedulesToDevice = this.sendSchedulesToDevice.bind(this)
		this.getSchedulesForDevice = this.getSchedulesForDevice.bind(this);
		this.resetStates = this.resetStates.bind(this)
	}

	generateId() {
		var id = Math.floor(Math.random() * 9999);
		var foundId = _.find(this.state.schedules, schedule => schedule.id === id);
		if (foundId)
			return this.generateId();
		else
			return id;
	}

	createSchedule(time, repVal) {
		var id = this.generateId().toString();
		var rep = repVal.toString();

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
		this.setState({ saveState: 'working' })
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
			return res.json();
		})
		.then(function(json) {
			if (json != null) {
				var result = JSON.parse(json).confirmSave;
				self.setState({ saveState: result });
			}
			else
				self.setState({ saveState: "fail" });
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	// Haetaan laitteen aikataulut
	getSchedulesForDevice(device, callback) {
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
			return res.json();
		})
		.then(function(scheduleJson) {
			callback(JSON.parse(scheduleJson).schedule); // parsitaan taulukko schedule-objekteja JSON:ista
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	// Haetaan aikataulu ensimmäistä kertaa
	componentDidMount() {
		var self = this;
		this.getSchedulesForDevice(this.props.activeDeviceVal, function(schedules) {
			self.setState({ schedules: schedules });
		});
	}

	// Aktiivinen laite vaihtuu -> haetaan uusi aikataulu
	componentWillReceiveProps(nextProps) {
		var self = this;
		this.getSchedulesForDevice(nextProps.activeDeviceVal, function(schedules) {
			self.setState({ schedules: schedules });
		});	
	}

	resetStates() {
		this.setState({ saveState: '' })
	}

	render() {
		let modal = null;
		if (this.state.saveState) 
		{
			switch(this.state.saveState) {
				case 'working':
					modal = <ModalComponent title="Tallennetaan laitteelle" info="Odota hetki..." barClass="progress-bar progress-bar-striped active" showCloseBtn={false} onCloseModal={this.resetStates} />
					break;
				case 'success':
					modal = <ModalComponent title="Tallennus onnistui" info="Uusi aikataulu tallennettu ja toiminnassa!" barClass="progress-bar progress-bar-success progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
				case 'fail':
					modal = <ModalComponent title="Tallennus epäonnistui" info="Onko Raspi päällä ja yhdistetty nettiin?" barClass="progress-bar progress-bar-danger progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
			}
		}

		return (
			<div>
				{modal}
				<div className="well">
					<h2>Ruokinta aikataulu</h2><br />
					<CreateScheduleComponent createSchedule={this.createSchedule.bind(this)} /><br />
					<ScheduleListComponent schedules={this.state.schedules} toggleSchedule={this.toggleSchedule.bind(this)} deleteSchedule={this.deleteSchedule.bind(this)} /><br />
					<button type="button" className="button button-block" onClick={this.sendSchedulesToDevice}>Tallenna</button>
				</div>
			</div>
		);
	}
}
