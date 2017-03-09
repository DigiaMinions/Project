import React from 'react'

const graphanaUrl = "http://172.31.31.15:3000/dashboard-solo/db/newdashboard?panelId=1&var-mac=";
const theme = "&theme=light";

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		const startTime = this.props.startTime;
		const endTime = this.props.endTime;
		
		return (
			<div>
				<br />
				<iframe src={graphanaUrl + String(this.props.activeDeviceVal) + theme + "&from=" + startTime + "&to=" + endTime} width='845' height='400' frameBorder='0' />
				<br />
			</div>
		);
	}

}

