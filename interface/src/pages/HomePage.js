import React, {useState, useEffect, useRef} from "react";
import signupButton from "../icons/signup-button.svg";
import submitButton from "../icons/submit-button.svg";
import sample from "../icons/sample-video.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';
import toia_home_vid from "../video/TOIA-LOGO-VID.mov";
import Tracker from "../utils/tracker";
import {NotificationManager} from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";

import NavBar from './NavBar.js';

import i18n from "i18next";
import { useTranslation } from "react-i18next";

function HomePage() {

  function exampleReducer( state, action ) {
    switch (action.type) {
      case 'close':
        return { open: false };
      case 'open':
        return { open: true };
    }
  }

  const { t } = useTranslation();

  var input1, input2; //these hold all the user login data

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})

  const [toiaName, setName] = useState(null);
  const [toiaLanguage, setLanguage] = useState(null);
  const [toiaID, setTOIAid] = useState(null);
  const [isLoggedIn,setLoginState]=useState(false);

  const { open } = state;

  useEffect(() => {
    if(history.location.state!=undefined){
      setLoginState(true);
      setName(history.location.state.toiaName);
      setLanguage(history.location.state.toiaLanguage);
      setTOIAid(history.location.state.toiaID);
    }

    // Tracker
    new Tracker().startTracking(history.location.state);
  },[]);

  function openModal(e){
    dispatch({ type: 'open' });
    e.preventDefault();
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

  const videoRef= useRef();
  const setPlayBack = () => {
    videoRef.current.playbackRate = 1.5;
  };

  return (
    <div className="home-page">
      {NavBar(toiaName, toiaID, toiaLanguage, isLoggedIn, history, dispatch, open, t)}

      <video ref={videoRef} onCanPlay={() => setPlayBack()} className="home-sample-videos home-animate-enter"autoPlay muted>
          <source src={toia_home_vid} type="video/mp4"/>

          Your browser does not support the video tag.
      </video>

      <div className="home-overlap-group">
        <div className={`home-des home-montserrat-black ${t("alignment")}`}> {t("tagline")}</div>
        <h1 className="home-toia home-opensans-normal">TOIA</h1>
        <div className={`home-welcome-text home-montserrat-black ${t("alignment")}`}> {t("welcome")} </div>
        <div onClick={signup}><img className="home-signup" src={signupButton} /></div>
      </div>
      <NotificationContainer/>

    </div>
  );
}

export default HomePage;


// ${right_languages.includes(toiaLanguage) ? 'right-align' : ''}`