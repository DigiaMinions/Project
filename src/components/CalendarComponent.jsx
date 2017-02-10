import React from 'react'
import DatePicker from 'react-bootstrap-date-picker'
import { FormGroup, ControlLabel, Col } from 'react-bootstrap'

export default class CalendarComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = { value: new Date().toISOString() }
		this.handleChange = this.handleChange.bind(this)
	}
	
	handleChange (value, formattedValue) { 
		this.setState({ 
			value: value,
			formattedValue: formattedValue
		})
		this.props.onUpdate(formattedValue);
	}

	render() {
		return (
			<FormGroup>
				<ControlLabel>{this.props.labelText}</ControlLabel>
				<DatePicker id="datepicker" value={this.state.value} onChange={this.handleChange} dateFormat="YYYY-MM-DD" />
			</FormGroup>
		);
	}

}