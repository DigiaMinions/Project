import React from 'react'
import { Col, Button, Panel } from 'react-bootstrap'
import CreateScheduleComponent from './CreateScheduleComponent.jsx'
import ScheduleListComponent from './ScheduleListComponent.jsx'

const schedules = [
{
	time: '10:00',
	rep: 0,
	isActive: false
},
{
	time: '12:30',
	rep: 0,
	isActive: true
}
];

export default class Schedule extends React.Component {

	constructor(props) {
		super(props);
		this.state = { schedules };
	}

	render() {
		return (
			<div>
				<Col xs={12}>
					<h2>Ruokinta aikataulu</h2>
					<CreateScheduleComponent schedules={this.state.schedules} createSchedule={this.createSchedule.bind(this)} />
					<ScheduleListComponent
						schedules={this.state.schedules}
					/>
				</Col>
			</div>
		);
	}

	createSchedule(time, rep) {
		this.state.schedules.push({
			time,
			rep,
			isActive: false
		});
		this.setState({ schedules: this.state.schedules });
	}

	toggleSchedule(schedule) {
		// TODO
	}

	saveSchedule(oldSchedule, newSchedule) {
		// TODO
	}

	deleteSchedule(scheduleToDelete) {
		// TODO
	}

}
