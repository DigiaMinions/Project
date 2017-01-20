import React from 'react'
import Dropdown from 'react-dropdown'

const userDevices = [
    '0C%3A69%3A40%3A30%3A73%3A67', '0A%3AE2%3AA3%3AC0%3AAD%3AF8' // logged in user's devices MACs from db (: encoded as %3A)
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
		const defaultValue = this.state.selected		
		return (
			<div>
				Valitse laite:
				<Dropdown options={userDevices} onChange={this.onSelect} value={defaultValue} placeholder="Valitse laite" />
			</div>
		);
	}
}
