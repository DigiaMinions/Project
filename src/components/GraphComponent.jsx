import React from 'react'

const graphanaUrl = "http://34.249.181.173:3000/dashboard-solo/db/newdashboard?panelId=1&var-mac=";
const theme = "&theme=light";

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
				<br />
				 {console.log(this.props.startTime)}
				 {console.log(this.props.endTime)}
				<iframe src={graphanaUrl + String(this.props.activeDevice.value) + theme + "&from=" + this.props.startTime + "&to=" + this.props.endTime} width='845' height='400' frameBorder='0' />
				<br />
			</div
>		);
	}
}

