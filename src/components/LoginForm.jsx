import React from 'react'
import 'whatwg-fetch'

export default class LoginForm extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {email: '', password: ''};
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.onLogin = this.onLogin.bind(this)
	}

	handlePasswordChange(event)
	{
		this.setState({password: event.target.value})
	}

	handleEmailChange(event)
	{
		this.setState({email: event.target.value})
	}

	handleKeyDown(event) 
	{
		if (event.key == 'Enter') {
			this.onLogin();
		}
	}

	onLogin()
	{		
		
		var form = new FormData();
		form.append('email', this.state.email);
		form.append('password', this.state.password);
		var that = this;
		// API kutsu Fetchillä
		fetch('/login', {
			method: 'POST',
			body: form,			
			credentials: 'same-origin',
			redirect: 'follow'
		})
		.then(function(res) {
			console.log('RESPONSE: ' + res);
			window.location.href = '/';

		})
		.catch(function(err) {
			console.log("Erroria puskee: ", err);
			window.location.href = '/login';
		});
	}

	render()
	{
		return(
				<div className="login">
						<div className="field-wrap">
							<input name="email" type="email" required placeholder="Sähköposti" onChange={this.handleEmailChange} autoComplete="on" onKeyDown={this.handleKeyDown} />
						</div>
						<div className="field-wrap">
							<input name="password" type="password" required placeholder="Salasana" onChange={this.handlePasswordChange} autoComplete="on" onKeyDown={this.handleKeyDown} />
						</div>
						{/*<p className="forgot"><a href="#">Forgot Password?</a></p>*/}
						<button onClick={() => this.onLogin()} className="button button-lg button-block">Kirjaudu</button>
				</div>
			);
	}
}