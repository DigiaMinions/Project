import React from 'react';

export default class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			// <iframe src={this.props.activeDevice}></iframe>
			<div><h3>{"TÄSSÄ_URLI_GRAFANAAN?MAC=" + this.props.activeDevice.value}</h3></div>
		);
	}
}