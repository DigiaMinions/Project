import React from 'react'
import 'whatwg-fetch'

export default class LoginForm extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {email: '', password: ''};
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
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

	onLogin()
	{		
	

		// API kutsu Fetchillä
		fetch('/login', {
			credentials: 'same-origin',
			headers:{
   				'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
  				'Content-Type': 'application/json'
			},			
			method: 'POST',
			body: JSON.stringify({
			    email: this.state.email,
			    password: this.state.password,
			    redirect_url: '/'
			})
		})
		.then(function(res) {
			console.log("Successia puskee: ", res);
			window.redirect('/');
		})
		.catch(function(err) {
			console.log("Erroria puskee: ", err);
		});
	}

	render()
	{
		return(
				<div className="login">
					<form method='post' action='/login'>
						<div className="field-wrap">
							<input name="email" type="email" required placeholder="Sähköposti" onChange={this.handleEmailChange} autoComplete="on"/>
						</div>
						<div className="field-wrap">
							<input name="password" type="password" required placeholder="Salasana" onChange={this.handlePasswordChange} autoComplete="on"/>
						</div>
						{/*<p className="forgot"><a href="#">Forgot Password?</a></p>*/}
						<button className="button button-lg button-block">Kirjaudu</button>
					</form>
				</div>
			);
	}
}