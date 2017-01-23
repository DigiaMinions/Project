import React from 'react';

const graphanaUrl = "http://34.248.219.178:3000/dashboard-solo/db/newdashboard?panelId=1&tab=time%20range&var-mac=";
const time = "";
var theme = "&theme=light";

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
				<br />
				<iframe src={graphanaUrl + String(this.props.activeDevice.value) + time + theme} width='800' height='400' frameBorder='0' />
				<br />				
				<div><h3>{this.props.activeDevice.value}</h3></div>
			</div>
		);
	}
}

