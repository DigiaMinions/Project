import React from 'react'

export default class LoginForm extends React.Component {

  render() 
  {  
    return(
        <div className="login">   
          <h1>Welcome Back!</h1>      
          <form action="/" method="post">      
              <div className="field-wrap">                
                <input type="email" required placeholder="Email address" autocomplete="off"/>
              </div>        
              <div className="field-wrap">                
                <input type="password" required placeholder="Password" autocomplete="off"/>
              </div>        
              {/*<p className="forgot"><a href="#">Forgot Password?</a></p>*/}    
              <button className="button button-block">Log In</button>      
          </form>
        </div>
      );
  }
}