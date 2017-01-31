import React from 'react'

export default class ScheduleListItem extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { id, time, rep, isActive } = this.props;
		var classes = "list-group-item clearfix";
		var txtToggle = "Off"
		if (isActive === true) {
			classes = classes + " list-group-item-success";
			txtToggle = "On";
		}

		return (
			<li className={classes}>
				{time} -- {rep}
				<div className="pull-right" role="group">
					<button type="button" className="btn btn-default" onClick={this.props.toggleSchedule.bind(this, id)} style={{ margin: "0 5px 0 0" }}>{txtToggle}</button>
					<button type="button" className="btn btn-danger" onClick={this.props.deleteSchedule.bind(this, id)}>&#xff38;</button>
				</div>
			</li>
		);
	}
}