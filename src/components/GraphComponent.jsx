import React from 'react';

const graphanaUrl = "http://34.248.219.178:3000/dashboard-solo/db/newdashboard?panelId=1&tab=time%20range&var-mac=";
const time = "&from=1484806803985&to=1484828403985";
var theme = "&theme=light";

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div>
				<br />
				<iframe src={graphanaUrl + this.props.activeDevice + time + theme} width='800' height='400' frameBorder='0' />
				<br />				
				<div><h3>{"TÄSSÄ_URLI_GRAFANAAN?MAC=" + this.props.activeDevice.value}</h3></div>
			</div>
		);
	}
}

