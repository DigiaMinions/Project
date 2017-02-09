import React from 'react'

const graphanaUrl = "http://34.249.240.86:3000/dashboard-solo/db/newdashboard?panelId=1&var-mac=";
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
		console.log(startTime);
		console.log(epochStartTime);
		
		return (
			<div>
				<br />
				<iframe src={graphanaUrl + String(this.props.activeDevice) + theme + "&from=" + epochStartTime + "&to=" + epochEndTime} width='845' height='400' frameBorder='0' />
				<br />
			</div>
		);
	}

}

