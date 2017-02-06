import React from 'react'
import Dropdown from 'react-dropdown'

const userDevices = [
	'123', '456' // TODO: Kirjautuneen käyttäjän MACit kannasta... (: enkoodataan %3A)
]

export default class DevicesComponent extends React.Component {

	constructor (props) {
		super(props)
		this.state = { selected: userDevices[0] }
		this.onSelect = this.onSelect.bind(this)
	}

	onSelect (option) {
		this.setState({selected: option})
		this.props.onUpdate(option)
	}

	render() {
		const selectedValue = this.state.selected;
		return (
			<div>
				Valitse laite:
				<Dropdown options={userDevices} onChange={this.onSelect} value={selectedValue} placeholder="Valitse laite" />
			</div>
		);
	}

}
