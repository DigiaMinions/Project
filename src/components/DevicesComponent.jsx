import React from 'react'
import Dropdown from 'react-dropdown'

const userDevices = [
    '123', '666', '9999' //current user's devices MACs from db
  ]

class DevicesComponent extends React.Component {
	
	constructor (props) {
		super(props)
		this.state = {
			selected: userDevices[0]
		}
		this._onSelect = this._onSelect.bind(this)
	}
  
	_onSelect (option) {
		console.log('You selected ', option.label)
		this.setState({selected: option})
	}
  
   render() {
		const defaultOption = this.state.selected
		const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label
		
		return (
			<div>
				<Dropdown options={userDevices} onChange={this._onSelect} value={defaultOption} placeholder="Valitse laite" />
				<div className='result'>
					You selected
					<strong> {placeHolderValue} </strong>
				</div>
			</div>
		)
	}
}

export default DevicesComponent;
