import './App.css';
import './HomePage.css';
import 'semantic-ui-css/semantic.min.css';
import React, {useState, useEffect, useRef} from "react";
import signupButton from "../icons/signup-button.svg";
import submitButton from "../icons/submit-button.svg";
import sample from "../icons/sample-video.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';
import env from './env.json';


function HomePage() {

  function exampleReducer( state, action ) {
    switch (action.type) {
      case 'close':
        return { open: false };
      case 'open':
        return { open: true };
    }
  }


  let welcome_text= "Welcome to";
  let toia_text= "TOIA";
  let blurb = " experience communication and interaction reimagined.";
  var input1, input2; //these hold all the user login data
  let isLogin = false; // this will tell if user is logged in to determine whether my TOIA will activate login pop *Wahib*

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
  var [hasEmailError, setHasEmailError] = useState(false);
  var [hasPasswordError, setHasPasswordError] = useState(false);
  const { open } = state

  function openModal(e){
    dispatch({ type: 'open' });
    e.preventDefault();
  }

  function ErrorComponent_email() {
    return <p>E-mail not found</p>
  }

  function ErrorComponent_pwd() {
    return <p>Password not found</p>
  }

  function myChangeHandler(event){
    event.preventDefault();
    var name = event.target.name;

    switch(name) {
      case "email":
        input1 = event.target.value;
        break;
      case "pass":
        input2 = event.target.value;
        break;
    }
  }

  function submitHandler(e){
    e.preventDefault();

    console.log(env);

    setHasEmailError(false);
    setHasPasswordError(false);

    let params={
      email:input1,
      pwd:input2
    }

    axios.post(`${env['server-url']}/login`,params).then(res=>{
      if(res.data==-1){
          //alert('Email not found');
        setHasEmailError(true);
      }else if(res.data==-2){
        setHasPasswordError(true);
      }else {
        console.log(res.data);
        history.push({
          pathname: '/garden',
          state: {
            toiaName:res.data.firstName,
            toiaLanguage:res.data.language,
            toiaID: res.data.toia_id
          }
        });
      }
    });
  }

  function home() {
    history.push({
      pathname: '/',
    });
  }

  function about() {
    history.push({
      pathname: '/about',
    });
  }

  function library() {
    history.push({
      pathname: '/library',
    });
  }

  function garden(e) {
    if (isLogin) {
      history.push({
        pathname: '/garden',
      });
    }else{
      openModal(e);
    }
  }

  function signup(){
    history.push({
      pathname: '/signup',
    });
  }

  const inlineStyle = {
    modal : {
        height: '560px',
        width: '600px',
    }
  };

  return (
    <div className="home-page">
      <Modal //this is the new pop up menu
        size='large'
        style={inlineStyle.modal}
        open={open}
        onClose={() => dispatch({ type: 'close' })}
      >
            <Modal.Header className="login_header">
              <h1 className="login_welcome login-opensans-normal">Welcome Back</h1>
              <p className="login_blurb login-montserrat-black">Enter the following information to login to your TOIA account</p>
            </Modal.Header>

            {hasEmailError && <ErrorComponent_email></ErrorComponent_email>}
            {hasPasswordError && <ErrorComponent_pwd></ErrorComponent_pwd>}

            <Modal.Content>
              <form className="login_popup" onSubmit={submitHandler}>
                <input
                  className="login_email login-font-class-1"
                  placeholder={"Email"}
                  type={"email"}
                  required={true}
                  onChange={myChangeHandler}
                  name={"email"}
                />
                <input
                  className="login_pass login-font-class-1"
                  placeholder={"Password"}
                  type={"password"}
                  required={true}
                  onChange={myChangeHandler}
                  name={"pass"}
                />
                <input className="login_button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
                <div className="login_text login-montserrat-black" onClick={signup}>Don't have an Account? Sign Up</div>
              </form>
            </Modal.Content>
        </Modal>

      <div className="nav-heading-bar">
        <div onClick={home} className="nav-toia_icon app-opensans-normal">
          TOIA
        </div>
        <div onClick={about} className="nav-about_icon app-monsterrat-black">
          About Us
        </div>
        <div onClick={library} className="nav-talk_icon app-monsterrat-black">
          Talk To TOIA
        </div>
        <div onClick={garden} className="nav-my_icon app-monsterrat-black">
          My TOIA
        </div>
        <div onClick={openModal}className="nav-login_icon app-monsterrat-black">
          Login
        </div>
      </div>
      <img className="home-sample-videos home-animate-enter" src={sample} />

      <div className="home-overlap-group">
        <div className="home-des home-montserrat-black">{blurb}</div>
        <h1 className="home-toia home-opensans-normal">{toia_text}</h1>
        <div className="home-welcome-text home-montserrat-black">{welcome_text}</div>
        <div onClick={signup}><img className="home-signup" src={signupButton} /></div>
      </div>
    </div>
  );
}

export default HomePage;
