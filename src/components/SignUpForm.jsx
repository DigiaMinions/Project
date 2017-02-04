import React from 'react'

export default class SignUpForm extends React.Component {

  render() 
  {  
    return(

        <div className="signup">   
          <h1>Sign up for free</h1>      
          <form action="/" method="post"> 
              <div className="top-row">
                <div className="field-wrap">
                  <input type="text" required placeholder="First name" autocomplete="off" />
                </div>      
                <div className="field-wrap">
                  <input type="text"required placeholder="Last name" autocomplete="off"/>
                </div>
              </div>

              <div className="field-wrap">
                <input type="email" required placeholder="Email address" autocomplete="off"/>
              </div>
              
              <div className="field-wrap">
                <input type="password"required placeholder="Password" autocomplete="off"/>
              </div>
              
              <button type="submit" className="button button-block">Get Started</button> 
               
          </form>
        </div>

    )
  }
}