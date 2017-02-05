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
          <h1>Sign up for free</h1>      
          <form action='/signup' method='post'> 
              <div className="top-row">
                <div className="field-wrap">
                  <input name="firstname" type="text" required placeholder="First name" autoComplete="off" />
                </div>      
                <div className="field-wrap">
                  <input name="lastname" type="text" required placeholder="Last name" autoComplete="off"/>
                </div>
              </div>

              <div className="field-wrap">
                <input name="email" type="email" required placeholder="Email address" autoComplete="off"/>
              </div>
              
              <div className="field-wrap">
                <input name="password" type="password" required placeholder="Password" autoComplete="off"/>
              </div>
              
              <button onClick={() => this.onSignUp()} className="button button-block">Get Started</button> 
               
          </form>
        </div>

    )
  }
}