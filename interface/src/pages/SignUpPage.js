import './App.css';
import './SignUpPage.css';
import React from "react";
import submitButton from "../icons/signup-button.svg";
import history from '../services/history';
import backButton from "../icons/back-button.svg";

function SignUpPage() {
  var inputName= "fname";
  var inputName2= "lname";
  var inputName3= "email";
  var inputName4= "pass";
  var inputName5= "pass1";

  var input1, input2, input3, input4, input5; //these hold all the user sign up data, they follow the order first name, 
  //last name, email and password, ignore input5  and access them in the submitHandler Function(wahib)

  function myChangeHandler(event){
    event.preventDefault();
    var name = event.target.name;

    switch(name) {
      case inputName:
        input1 = event.target.value;
        break;
      case inputName2:
        input2 = event.target.value;
        break;
      case inputName3:
        input3 = event.target.value;
        break;
      case inputName4:
        input4 = event.target.value;
        break;
      case inputName5:
        input5 = event.target.value;
        break;
    }
  }

  function submitHandler(){
    history.push({
      pathname: '/settings',
    });
    //access them here
  }

  function goBack(){
    history.goBack();
  }

  return (
    <form className="signup-page" onSubmit={submitHandler}>
      <input className="signup-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
      <div className="signup-group">
          <input
              className="signup-pass1 signup-font-class-1"
              name={inputName5}
              placeholder={"Confirm Password"}
              type={"password"}
              //required={true}
              onChange={myChangeHandler}
          />
          <input
              className="signup-pass signup-font-class-1"
              name={inputName4}
              placeholder={"New Password"}
              type={"password"}
              //required={true}
              onChange={myChangeHandler}
          />
          <input
              className="signup-email signup-font-class-1"
              name={inputName3}
              placeholder={"Email"}
              type={"email"}
              //required={true}
              onChange={myChangeHandler}
          />
          <input
              className="signup-lname signup-font-class-1"
              name={inputName2}
              placeholder={"Last Name"}
              type={"text"}
              //required={true}
              onChange={myChangeHandler}
          />
          <input
              className="signup-fname signup-font-class-1"
              name={inputName}
              placeholder={"First Name"}
              type={"text"}
              //required={true}
              onChange={myChangeHandler}
          />
          <h1 className="signup-title signup-font-class-3 ">Get Started</h1>
      </div>
      <div onClick={goBack}><img className="signup-back_icon" src={backButton} /></div>
    </form>
  );
}

export default SignUpPage;