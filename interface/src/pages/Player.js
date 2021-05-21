import './App.css'
import './Player.css';
import 'semantic-ui-css/semantic.min.css';
import React, {Component} from 'react';
import {useState, useEffect} from 'react';
import submitButton from "../icons/submit-button.svg";
import axios from 'axios';
import {Modal} from 'semantic-ui-react';
import history from '../services/history';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function Player(){

  function exampleReducer( state, action ) {
      switch (action.type) {
        case 'close':
          return { open: false };
        case 'open':
          return { open: true }; 
      }
  }

  const { transcript, resetTranscript } = useSpeechRecognition({command: '*',callback:fetchData});
  
  const [avatarName, setAvatarName] = React.useState(null);
  const [language, setLanguage] = React.useState(null);
  const [interactionLanguage,setInteractionLanguage] = useState(null);
  const [avatarID,setAvatarID] = React.useState(null);
  const [video,setVideo] = useState(null);
  const [caption,setCaption] = useState(null);
  let isLogin = false; //login variable
  var input1, input2;

  React.useEffect(() => {
    setAvatarName(history.location.state.name);
    setLanguage(history.location.state.language);
    setInteractionLanguage(history.location.state.interactionLanguage);
    setAvatarID(history.location.state.avatarID);
  });


  function fetchData(event){

    event.preventDefault();
  
    SpeechRecognition.stopListening();

    let question = transcript[0].toUpperCase()+transcript.slice(1);

    let videoElem= <video className="player-vid" key={question} autoPlay><source src={`http://localhost:3000/player/${avatarID}/${avatarName}/${language}/${question}`} type='video/mp4'></source></video>;

    setVideo(videoElem);

  }

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const { open } = state

    function openModal(e){
        dispatch({ type: 'open' });
        e.preventDefault();
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

    function submitHandler(){
        history.push({
            pathname: '/garden',
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

   function logout(){
       //logout function needs to be implemented (wahib)
       history.push({
           pathname: '/',
         });
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
    <div className="player">
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
          <div onClick={about} className="nav-about_icon app-monsterrat-black ">
              About Us
          </div>
          <div onClick={library} className="nav-talk_icon app-monsterrat-black ">
              Talk To TOIA
          </div>
          <div onClick={garden} className="nav-my_icon app-monsterrat-black ">
              My TOIA
          </div>
          <div onClick={isLogin ? logout : openModal}className="nav-login_icon app-monsterrat-black">
              {isLogin ? 'Logout' : 'Login'}
          </div>
      </div>
      <div className="player-group">
        <h1 className="player-name player-font-class-3 ">{avatarName}</h1>
        <p className="player-lang player-font-class-2 ">{language}</p>
        {video}
        <button onClick={()=>{SpeechRecognition.startListening({ continuous: true })}}>Start</button>
        <button onClick={fetchData}>Stop</button>
        <button onClick={resetTranscript}>Reset</button>
        <p>{transcript}</p>

      </div>
    </div>
  )
}

export default Player;

