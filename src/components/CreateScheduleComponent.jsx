import React from 'react'
import Select from 'react-select'
import { Alert, Button } from 'react-bootstrap'

export default class CreateScheduleComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = { date: '', showError: false }
	}

	render() {
		var options = [
    		{ value: '1', label: 'Ma' },
    		{ value: '2', label: 'Ti' },
    		{ value: '4', label: 'Ke' },
    		{ value: '8', label: 'To' },
    		{ value: '16', label: 'Pe' },
    		{ value: '32', label: 'La' },
    		{ value: '64', label: 'Su' },
		];

		let error = null;
		if (this.state.showError) {
			error = <Alert bsStyle="danger">Syötä kellonaika (HH:MM) ja päivämäärä!</Alert>;
		}

		return (
			<div>
			{error}
			<form onSubmit={this.handleCreate.bind(this)} className="form-inline">			
				<div className="input-group col-xs-3">
					<input type="text" ref="timeInput" className="form-control" placeholder="Kellonaika (HH:MM)" />
					<span className="input-group-addon">
	        			<span className="glyphicon glyphicon-time"></span>
	    			</span>
				</div>
				<div className="input-group col-xs-6">
					<Select value={this.state.date} options={options} onChange={this.handleSelectChange.bind(this)} multi={true} placeholder="Valitse päivät" />
				</div>
				<button type="submit" className="btn btn-default">Luo</button>
			</form>
			</div>
		);
	}

	handleSelectChange(val) {
		this.setState({ date: val });
	}

	handleCreate(event) {
		event.preventDefault();
		this.setState({ showError: false });
		const timeInput = this.refs.timeInput;
		const time = timeInput.value;
		var re = new RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"); // HH:MM
		const rep = _.map(this.state.date, "value");

		if (re.test(time) && rep.length > 0) {
			var sum = rep.reduce(function(a, b) { return parseInt(a) + parseInt(b); })
			this.props.createSchedule(time, sum);
			this.refs.timeInput.value = '';
			this.state.date = '';
		}
		else
		{
			this.setState({ showError: true });
		}

	}
}