import React from 'react';
import {render} from 'react-dom';
import AwesomeComponent from './components/AwesomeComponent.jsx';
import GraphComponent from './components/GraphComponent.jsx';

class App extends React.Component {
  render () {
    return (
      <div>
        <div className='jumbotron'>
			<h1>Feeder</h1> 
			<p>Tässä se nyt on!</p> 
		</div>
		<GraphComponent url="http://www.clocktab.com/" />
		<AwesomeComponent />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));