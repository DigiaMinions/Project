import React from 'react'
import Dropdown from 'react-dropdown'

const userDevices = [
    '123', '666', '9999' // logged in user's devices MACs from db
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
