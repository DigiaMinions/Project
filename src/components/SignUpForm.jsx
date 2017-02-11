import React from 'react'
import 'whatwg-fetch'

export default class SignUpForm extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {email: '', password: '', firstname: '', lastname: ''};
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handleFirstnameChange = this.handleFirstnameChange.bind(this)
		this.handleLastnameChange = this.handleLastnameChange.bind(this)
		this.onSignUp = this.onSignUp.bind(this)		
	}

	handlePasswordChange(event)
	{
		console.log(event.target.value)
		this.setState({password: event.target.value})
	}

	handleEmailChange(event)
	{
		console.log(event.target.value)
		this.setState({email: event.target.value})
	}

	handleLastnameChange(event)
	{
		console.log(event.target.value)
		this.setState({lastname: event.target.value})
	}

	handleFirstnameChange(event)
	{
		console.log(event.target.value)
		this.setState({firstname: event.target.value})
	}

	onSignUp()
	{
			var form = new FormData();
			console.log(this.state)
			form.append('email', this.state.email);
			form.append('password', this.state.password);
			form.append('firstname', this.state.firstname);
			form.append('lastname', this.state.lastname);
			// API kutsu Fetchillä
			fetch('/signup', {
				credentials: 'same-origin',
				method: 'POST',
				body: form,
				redirect: 'follow'
			})
			.then(function(res) {
				console.log("Successia puskee: ", res);
				window.location.href = '/';
			})
			.catch(function(err) {
				console.log("Erroria puskee: ", err);
				window.location.href = '/signup';
			});
	}

	render()
	{
		return(
			<div className="login">
				<div className="top-row">
					<div className="field-wrap">
						<input name="firstname" type="text"  onChange={this.handleFirstnameChange} required placeholder="Etunimi" autoComplete="off" />
					</div>      
					<div className="field-wrap">
						<input name="lastname" type="text"  onChange={this.handleLastnameChange} required placeholder="Sukunimi" autoComplete="off"/>
					</div>
				</div>

				<div className="field-wrap">
					<input name="email" type="email" onChange={this.handleEmailChange} required placeholder="Sähköposti" autoComplete="off"/>
				</div>
				
				<div className="field-wrap">
					<input name="password" type="password"  onChange={this.handlePasswordChange} required placeholder="Salasana" autoComplete="off"/>
				</div>
				
				<button onClick={() => this.onSignUp()} className="button button-lg button-block">Rekisteröidy</button> 
			</div>
		)
	}
}