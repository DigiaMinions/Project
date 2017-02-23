import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import CalendarComponent from './CalendarComponent.jsx'
import ModalComponent from './ModalComponent.jsx'
import { Panel, Col, Row } from 'react-bootstrap'
import 'whatwg-fetch'

export default class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = { activeDeviceVal: this.props.activeDeviceVal, startTime: 'now%2Fd', endTime: 'now', feedState: '', calibrateState: '' } // Oletuksena näyttää tämän päivän (tähän asti)
		this.onStartTimeChange = this.onStartTimeChange.bind(this)
		this.onEndTimeChange = this.onEndTimeChange.bind(this)
		this.onFeedButtonPress = this.onFeedButtonPress.bind(this)
		this.onCalibrateButtonPress = this.onCalibrateButtonPress.bind(this)
		this.setQuickRange = this.setQuickRange.bind(this)
		this.resetStates = this.resetStates.bind(this)
	}

	onStartTimeChange(time) {
		this.setState({ startTime: new Date(time).getTime()})
	}

	onEndTimeChange(time) {
		this.setState({ endTime: new Date(time).getTime()})
	}

	onFeedButtonPress() {
		var self = this;
		this.setState({ feedState: 'working' })
		fetch('/feed/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.props.activeDeviceVal
		})
		})
		.then(function(res) {
			return res.json();
		})
		.then(function(json) {
			if (json != null) {
				var result = JSON.parse(json).confirmFeed;
				self.setState({ feedState: result });
			}
			else
				self.setState({ feedState: "fail" });
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	onCalibrateButtonPress() {
		var self = this;
		this.setState({ calibrateState: 'working' })
		fetch('/calibrate/', {
			method: 'POST',
			headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mac: this.props.activeDeviceVal
		})
		})
		.then(function(res) {
			return res.json();
		})
		.then(function(json) {
			if (json != null) {
				var result = JSON.parse(json).confirmTare;
				self.setState({ calibrateState: result });
			}
			else
				self.setState({ calibrateState: "fail" });
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	setQuickRange(startTime, endTime) {
		this.setState({ startTime: startTime, endTime: endTime })
	}

	resetStates() {
		this.setState({ feedState: '', calibrateState: '' })
	}

	render() {
		let modal = null;
		if (this.state.feedState) 
		{
			switch(this.state.feedState) {
				case 'working':
					modal = <ModalComponent title="Sapuskaa tulossa!" info="Odota hetki..." barClass="progress-bar progress-bar-striped active" showCloseBtn={false} onCloseModal={this.resetStates} />
					break;
				case 'success':
					modal = <ModalComponent title="Kuppi täytetty!" info="Sit popsimaan." barClass="progress-bar progress-bar-success progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
				case 'fail':
					modal = <ModalComponent title="Syöttö epäonnistui" info="Onko Raspi päällä ja yhdistetty nettiin?" barClass="progress-bar progress-bar-danger progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
			}
		}
		if (this.state.calibrateState)
		{
			switch(this.state.calibrateState) {
				case 'working':
					modal = <ModalComponent title="Robotit kalibroivat anturiasi" info="Odota hetki..." barClass="progress-bar progress-bar-striped active" showCloseBtn={false} onCloseModal={this.resetStates} loadingImg={[<img src='/img/robot.gif' alt='loading'/>]} />
					break;
				case 'success':
					modal = <ModalComponent title="Anturi kalibroitu!" info="Kaikki kunnossa." barClass="progress-bar progress-bar-success progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
				case 'fail':
					modal = <ModalComponent title="Kalibrointi epäonnistui" info="Emme tiedä miksi. Kysy roboteilta." barClass="progress-bar progress-bar-danger progress-bar-striped" showCloseBtn={true} onCloseModal={this.resetStates} />
					break;
			}
		}

		return (
			<div>
				{modal}
				<br />
				<Row>
					<Col xs={6}><button type="button" onClick={this.onFeedButtonPress} className="button button-block" ref="btnFeed">Pötyä pöytään!</button></Col>
					<Col xs={6}><button type="button" onClick={this.onCalibrateButtonPress} className="button button-block" ref="btnCalib">Kalibroi anturi</button></Col>
				</Row>
				<GraphComponent activeDeviceVal={this.props.activeDeviceVal} startTime={this.state.startTime} endTime={this.state.endTime} />
				<Panel header="Näytä ruokailu ajalta">
				<Col xs={6} md={4}>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-1h", "now")}>Viimeinen 1 tunti</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-24h", "now")}>Viimeiset 24 tuntia</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now-1d%2Fd", "now-1d%2Fd")}>Eilen</a><br/>
					<a href="javascript:void(0)" onClick={() => this.setQuickRange("now%2Fw", "now%2Fw")}>Tällä viikolla</a><br/>
				</Col>
				<Col xs={6} md={4}>
					<strong>Mistä:</strong><CalendarComponent onUpdate={this.onStartTimeChange} labelText="Mistä:" />
				</Col>
				<Col xs={6} md={4}>
					<strong>Mihin:</strong><CalendarComponent onUpdate={this.onEndTimeChange} labelText="Mihin:" />
				</Col>
				</Panel>
			</div>
		);
	}
}
