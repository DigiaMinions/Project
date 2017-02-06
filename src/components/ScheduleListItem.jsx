import React from 'react'

export default class ScheduleListItem extends React.Component {

	constructor(props) {
		super(props);
		this.convertRepToDays = this.convertRepToDays.bind(this);
	}

	render() {
		const { id, time, rep, isActive } = this.props;
		var classes = "list-group-item clearfix";
		var txtToggle = "Off"
		if (isActive === true) {
			classes = classes + " list-group-item-success";
			txtToggle = "On";	
		}
		var days = this.convertRepToDays(rep);

		return (
			<li className={classes}>
				<button type="button" className="btn btn-default" onClick={this.props.toggleSchedule.bind(this, id)} style={{ margin: "0 5px 0 0" }}>{txtToggle}</button>
				{time} - {days.join(', ')}
				<div className="pull-right" role="group">				
					<button type="button" className="btn btn-danger" onClick={this.props.deleteSchedule.bind(this, id)}>&#xff38;</button>
				</div>
			</li>
		);
	}

	convertRepToDays(repValue) {
		// 1 2 4 8 16 32 64
		var repList = [];
		var currentValue = 64;

		while (currentValue >= 1) {
			if (repValue >= currentValue) {
				repList.push(currentValue)
				repValue = repValue - currentValue
				currentValue = currentValue / 2
			}
			else {
				currentValue = currentValue / 2
			}
		}
		for (var i = 0; i < repList.length; i++) {
			if (repList[i] == 1)
				repList[i] = "Ma";
			else if (repList[i] == 2)
				repList[i] = "Ti";
			else if (repList[i] == 4)
				repList[i] = "Ke";
			else if (repList[i] == 8)
				repList[i] = "To";
			else if (repList[i] == 16)
				repList[i] = "Pe";
			else if (repList[i] == 32)
				repList[i] = "La";
			else if (repList[i] == 64)
				repList[i] = "Su";
		}
		return repList.reverse();
	}
}