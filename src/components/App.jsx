import React from 'react'

class App extends React.Component {
	
  render() {
    return (
	  <div>
        <h1>Laitteet</h1>
        <ul role="nav">
		  <li><IndexLink to="/" activeClassName="active">Home</IndexLink></li>
          <li><Link to="/stuff" activeClassName="active">Stuff</Link></li>
		  <li><Link to="/contact" activeClassName="active">Contact</Link></li>
        </ul>
		<div className="content">
          {this.props.children}
		</div>
      </div>
	)
  }
}

export default App;