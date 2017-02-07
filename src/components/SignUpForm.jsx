import React from 'react'
import 'whatwg-fetch'

export default class SignUpForm extends React.Component {

	onSignUp()
	{
			var form = document.querySelector('form');
			console.log("Lähetetään request");
			// API kutsu Fetchillä
			fetch('/signup', {
				credentials: 'same-origin',
				method: 'POST',
				body: new FormData(form)
			})
			//.then(checkStatus)
			.then(function(res) {
				console.log("Successia puskee: ", res);
			})
			.catch(function(err) {
				console.log("Erroria puskee: ", err);
			});
	}

	render()
	{
		return(
				<div className="signup">
					<form action='/signup' method='post'>
							<div className="top-row">
								<div className="field-wrap">
									<input name="firstname" type="text" required placeholder="Etunimi" autoComplete="off" />
								</div>      
								<div className="field-wrap">
									<input name="lastname" type="text" required placeholder="Sukunimi" autoComplete="off"/>
								</div>
							</div>

							<div className="field-wrap">
								<input name="email" type="email" required placeholder="Sähköposti" autoComplete="off"/>
							</div>
							
							<div className="field-wrap">
								<input name="password" type="password" required placeholder="Salasana" autoComplete="off"/>
							</div>
							
							<button onClick={() => this.onSignUp()} className="button button-lg button-block">Rekisteröidy</button> 
					</form>
				</div>
		)
	}
}