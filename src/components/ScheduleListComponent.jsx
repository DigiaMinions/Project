import _ from 'lodash'
import React from 'react'
import ScheduleListItem from './ScheduleListItem.jsx'

export default class ScheduleListComponent extends React.Component {

	renderItems() {
		const props = _.omit(this.props, 'schedules');
		return _.map(this.props.schedules, (schedule, index) => <ScheduleListItem key={index} {...schedule} {...props} />);
	}

	render() {
		return (
			<table>
				<tbody>
					{this.renderItems()}
				</tbody>
			</table>
		);
	}
}