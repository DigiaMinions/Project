import React from 'react'
import Dropdown from 'react-dropdown'

const userDevices = [
    '02%3A5A%3A01%3A05%3A30%3A35', '00%3A10%3A20%3A30%3A40%3A50' // logged in user's devices MACs from db (: encoded as %3A)
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
