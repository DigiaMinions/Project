import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

export default class Login extends React.Component {
	

	onLogin() 
    {
    	var form = document.querySelector('form');
		// API kutsu Fetchillä
		fetch('/login', {
			method: 'POST',			
			body: new FormData(form)
		})
		//.then(checkStatus)
		.then(function(res) {
			console.log("Success: ", res);
		})
		.catch(function(err) {
			console.log("Error: ", err);
		});
	}

	render() 
	{
		return (
			<div>
				User: <input type="text" name="username"/>
				Pass: <input type="text" name="password"/>				
				<button onClick={() => this.onLogin()}>Log in</button>
			</div>
		);
	}
}

