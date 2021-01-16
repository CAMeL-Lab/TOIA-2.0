import './App.css';
import './HomePage.css';
import React from "react";
import loginButton from "../icons/login-button.svg";
import signupButton from "../icons/signup-button.svg";
import sample from "../icons/sample-video.svg";
import history from '../services/history';


function HomePage() {
  let welcome_text= "Welcome to";
  let toia_text= "TOIA";
  let toia_icon= "TOIA";
  let blurb = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean diam metus, efficitur et nunc ut";

  function login(){
    history.push({
      pathname: '/login',
    });
  }

  function signup(){
    history.push({
      pathname: '/signup',
    });
  }

  return (
    <div className="home-page">
      <div className="home-heading-bar">
        <div className="home-toia_icon home-opensans-normal">
          {toia_icon}
        </div>
      </div>
      <div className="home-rectangle"></div>
      <img className="home-sample-videos home-animate-enter" src={sample} />
      
      <div className="home-overlap-group">
        <div className="home-des home-montserrat-black">{blurb}</div>
        <h1 className="home-toia home-opensans-normal">{toia_text}</h1>
        <div className="home-welcome-text home-montserrat-black">{welcome_text}</div>
       
        <div onClick={login}><img className="home-login" src={loginButton} /></div>
        
        
        <div onClick={signup}><img className="home-signup" src={signupButton} /></div>
      
      </div>
    </div>
  );
}

export default HomePage;