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
import env from './env.json';

function Player(){

  function exampleReducer( state, action ) {
      switch (action.type) {
        case 'close':
          return { open: false };
        case 'open':
          return { open: true }; 
      }
  }

  const commands=[
    {
      command: '*',
      callback:fetchData
    }
  ];


  const { transcript, resetTranscript } = useSpeechRecognition(commands);
  
  const [toiaName, setName] = React.useState(null);
  const [toiaLanguage, setLanguage] = React.useState(null);
  const [interactionLanguage,setInteractionLanguage] = useState(null);
  const [toiaID,setTOIAid] = React.useState(null);
  const [isLoggedIn,setLoginState]=useState(false);

  const [toiaIDToTalk,setTOIAIdToTalk]=useState(null);
  const [toiaFirstNameToTalk,setTOIAFirstNameToTalk]=useState(null);
  const [toiaLastNameToTalk,setTOIALastNameToTalk]=useState(null);
  const [streamIdToTalk, setStreamIdToTalk]=useState(null);
  const [streamNameToTalk, setStreamNameToTalk]=useState(null);

  const [video,setVideo] = useState(null);
  const [caption,setCaption] = useState(null);

  var input1, input2;
  let [micMute, setMicStatus]=React.useState(false);
  let [micString, setMicString]=React.useState('Mute');

  React.useEffect(() => {
    if(history.location.state.toiaID!=undefined){
      setLoginState(true);
      setTOIAid(history.location.state.toiaID);
      setName(history.location.state.toiaName);
      setLanguage(history.location.state.toiaLanguage);
    }
    setTOIAIdToTalk(history.location.state.toiaToTalk);
    setTOIAFirstNameToTalk(history.location.state.toiaFirstNameToTalk);
    setTOIALastNameToTalk(history.location.state.toiaLastNameToTalk);
    setStreamIdToTalk(history.location.state.streamToTalk);
    setStreamNameToTalk(history.location.state.streamNameToTalk);

    if(micMute==false){
      SpeechRecognition.startListening({continuous:true});
    }

  });

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

  function fetchData(){

    // event.preventDefault();
  
    // SpeechRecognition.stopListening();

    if(transcript!=''){
      let question = transcript[0].toUpperCase()+transcript.slice(1);
      resetTranscript();

      let videoElem= <video className="player-vid" key={question} autoPlay><source src={`${env['server-url']}/player/${toiaIDToTalk}/${toiaFirstNameToTalk}/${question}`} type='video/mp4'></source></video>;

      setVideo(videoElem);
    }

  }

    function micStatusChange(){
      if(micMute==true){
        setMicStatus(false);
        setMicString('Mute');
        SpeechRecognition.startListening({continuous:true});
      }else{
        SpeechRecognition.stopListening();
        setMicStatus(true);
        setMicString('Unmute');
        fetchData();
  
      }

    }

    function submitHandler(e){
      e.preventDefault();

      let params={
          email:input1,
          pwd:input2
      }

      axios.post(`${env['server-url']}/login`,params).then(res=>{
          if(res.data==-1){
              //alert('Email not found');
              alert("Incorrect e-mail address.");
          }else if(res.data==-2){
              alert("Incorrect password.");
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
      if(isLoggedIn){
        history.push({
          pathname: '/',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
        });   
      }else{
        history.push({
          pathname: '/',
        });
      }
    }
    
    function about() {
      if(isLoggedIn){
          history.push({
          pathname: '/about',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
          }
          });   
      }else{
          history.push({
          pathname: '/about',
          });
      }
    }

    function library() {
      if(isLoggedIn){
          history.push({
          pathname: '/library',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
          }
          });   
      }else{
          history.push({
          pathname: '/library',
          });
      }
    }
  
    function garden(e) {
      if (isLoggedIn) {
          history.push({
          pathname: '/garden',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
              }
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
          <div onClick={isLoggedIn ? logout : openModal}className="nav-login_icon app-monsterrat-black">
              {isLoggedIn ? 'Logout' : 'Login'}
          </div>
      </div>
      <div className="player-group">
        <h1 className="player-name player-font-class-3 ">{toiaFirstNameToTalk} {toiaLastNameToTalk}</h1>
        <p className="player-lang player-font-class-2 ">{streamNameToTalk}</p>
        {video}
        {/* <button onClick={()=>{SpeechRecognition.startListening({ continuous: true })}}>Start</button>
        <button onClick={fetchData}>Stop</button>
        <button onClick={resetTranscript}>Reset</button> */}
        <button onClick={micStatusChange}>{micString}</button>

      </div>
    </div>
  )
}

export default Player;

