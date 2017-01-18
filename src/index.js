import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import App from './components/App.jsx'
import Devices from './components/Devices.jsx'
import DeviceData from './components/DeviceData.jsx'

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="/devices" component={Devices}>
        <Route path="/devices/:userName/:deviceID" component={DeviceData}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('app'))