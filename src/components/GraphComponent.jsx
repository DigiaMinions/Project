import React from 'react';

class GraphComponent extends React.Component {

	constructor(props) {
		super(props);
		this.url = props.url;
	}
	
	render() {
		return (
			<iframe src={this.url} height="200" width="300"></iframe>
		);
	}
}

export default GraphComponent;