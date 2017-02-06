import React from 'react'

export default class CreateScheduleComponent extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<form onSubmit={this.handleCreate.bind(this)}>
				<strong>Kellon aika:</strong>
				<input type="text" ref="timeInput" />
				<strong>Viikonpäivät:</strong>
				<select multiple ref="repInput">
					<option value="1">Ma</option>
					<option value="2">Ti</option>
					<option value="4">Ke</option>
					<option value="8">To</option>
					<option value="16">Pe</option>
					<option value="32">La</option>
					<option value="64">Su</option>
				</select>
				<button>Luo uusi</button>
			</form>
		);
	}

	handleCreate(event) {
		event.preventDefault();
		const timeInput = this.refs.timeInput;
		const time = timeInput.value;

		const repInput = this.refs.repInput;
		const rep = $(repInput).val();
		var sum = rep.reduce(function(a, b) { return parseInt(a) + parseInt(b); });
		this.props.createSchedule(time, sum);
		this.refs.timeInput.value = '';
	}
}