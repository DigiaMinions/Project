import React from 'react'
import GraphComponent from './GraphComponent.jsx'
import DevicesComponent from './DevicesComponent.jsx'

class App extends React.Component {

  render() {
    return (
	  <div className="content">
		  <DevicesComponent />
          <GraphComponent url="http://www.google.fi" />
      </div>
	)
  }
}

export default App;