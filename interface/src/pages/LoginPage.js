import './App.css';
import './LoginPage.css';
import React from "react";
import submitButton from "../icons/submit-button.svg";
import backButton from "../icons/back-button.svg";
import history from '../services/history';

function LoginPage() {
  var inputName= "email";
  var inputName2= "pass";

  function submitHandler(event){
    event.preventDefault();
    history.push({
      pathname: '/menu',
    });
  }

  function goBack(){
    history.goBack();
  }

  function myChangeHandler(event){ //if statement 
    //inputName4 = event.target.value;
  }
  return (
    <form className="login-page" onSubmit={submitHandler}>
    <input className="login-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
    <div className="login-group">
        <input
            className="login-pass login-font-class-1"
            name={inputName2}
            placeholder={"Password"}
            type={"password"}
            //required={true}
        />
        <input
            className="login-email login-font-class-1"
            name={inputName}
            placeholder={"Email"}
            type={"email"}
            //required={true}
        />
        <h1 className="login-title login-font-class-3 ">Log In</h1>
    </div>
      <div onClick={goBack}><img className="login-back_icon" src={backButton} /></div>
    </form>
  );
}

export default LoginPage;
        