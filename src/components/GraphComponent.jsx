import React from 'react'

const graphanaUrl = "http://34.250.206.30:3000/dashboard-solo/db/newdashboard?panelId=1&var-mac=";
const theme = "&theme=light";

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		const startTime = this.props.startTime;
		const endTime = this.props.endTime;
		const epochStartTime = new Date(startTime).getTime();
		const epochEndTime = new Date(endTime).getTime();
		console.log('Start time: ' + startTime);
		console.log('Epoch start time: ' + epochStartTime);
		console.log('Graafille annettu (props)mac: ' + this.props.activeDeviceVal);
		
		return (
			<div>
				<br />
				<iframe src={graphanaUrl + String(this.props.activeDeviceVal) + theme + "&from=" + epochStartTime + "&to=" + epochEndTime} width='845' height='400' frameBorder='0' />
				<br />
			</div>
		);
	}

}

