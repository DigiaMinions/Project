import React from 'react'
import { Button, Panel, Modal } from 'react-bootstrap'
import CreateScheduleComponent from './CreateScheduleComponent.jsx'
import ScheduleListComponent from './ScheduleListComponent.jsx'
import 'whatwg-fetch'

export default class Schedule extends React.Component {

	constructor(props) {
		super(props);
		this.state = { schedules: [], showModal: false, saveState: '' };
		this.sendSchedulesToDevice = this.sendSchedulesToDevice.bind(this)
		this.getSchedulesForDevice = this.getSchedulesForDevice.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	render() {
		let title = null;
		let info = null;
		let progressBar = null;
		let closeButton = null;

		if (this.state.saveState == 'saving') {
			title = <Modal.Title>Tallennetaan laitteelle</Modal.Title>
			info = <p>Odota hetki...</p>
			progressBar = <div className="progress"><div className="progress-bar progress-bar-striped active" style={{ width: "100%" }}></div></div>
		}
		else if (this.state.saveState == 'success') {
			title = <Modal.Title>Tallennus onnistui</Modal.Title>
			info = <p>Uusi aikataulu tallennettu ja toiminnassa!</p>
			progressBar = <div className="progress"><div className="progress-bar progress-bar-success progress-bar-striped" style={{ width: "100%" }}></div></div>
			closeButton = <Button onClick={this.closeModal}>Sulje</Button>
		}
		else if (this.state.saveState == 'fail') {
			title = <Modal.Title>Tallennus epäonnistui</Modal.Title>
			info = <p>Onko Raspi päällä ja yhdistetty nettiin?</p>
			progressBar = <div className="progress"><div className="progress-bar progress-bar-danger progress-bar-striped" style={{ width: "100%" }}></div></div>
			closeButton = <Button onClick={this.closeModal}>Sulje</Button>
		}

		return (
			<div>
				<div className="well">
					<Modal show={this.state.showModal} onHide={this.closeModal}>
						<Modal.Header closeButton>
							{title}
						</Modal.Header>
						<Modal.Body>
							{info}
							{progressBar}
						</Modal.Body>
						<Modal.Footer>
							{closeButton}
						</Modal.Footer>
					</Modal>
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
		// avataan lataus ikkuna ja odotellaan raspilta kuittausta tallennuksesta
		this.openModal();
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
			return res.json();
		})
		.then(function(json) {
			var result = JSON.parse(json).confirmSave;
			self.setState({ saveState: result });
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
			console.log(schedules);
			self.setState({ schedules: schedules });
		});	
	}

	closeModal() {
		this.setState({ showModal: false, saveState: '' });
	}

	openModal() {
		this.setState({ showModal: true, saveState: 'saving' });
	}
}
