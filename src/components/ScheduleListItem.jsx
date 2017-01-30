import React from 'react'

export default class ScheduleListItem extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { time, rep, isActive } = this.props;
		return (
			<tr>
				<td>{time}</td>
				<td>{rep}</td>
				<td>{isActive}</td>
			</tr>
		);
	}
}