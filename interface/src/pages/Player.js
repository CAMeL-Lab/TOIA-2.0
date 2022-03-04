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
import Tracker from "../utils/tracker";

import speechToTextUtils from "../transcription_utils";
import {NotificationManager} from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";

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
      callback: fetchData
    }
  ];


  //const { transcript, resetTranscript } = useSpeechRecognition({commands});

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
  const [fillerPlaying, setFillerPlaying]=useState(true);

  const [video,setVideo] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);

  //const [question,setQuestion] = useState(null);
  //const [matched,setMatched]=useState(0);

  //const [transcribedAudio, setTranscribedAudio] = useState("");

  const transcribedAudio = React.useRef('');
  const textInput = React.useRef('');
  const question = React.useRef('');
  const interacting = React.useRef('false');


  var input1, input2;
  let [micMute, setMicStatus]=React.useState(true);
  let [micString, setMicString]=React.useState('INTERACT');

  useEffect(() => {
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

    fetchFiller();
    //SpeechRecognition.startListening({continuous:true});

      // Tracker
      new Tracker().startTracking(history.location.state);
  },[]);

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,});
  const { open } = state;

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

  //const controller = new AbortController();

  // handling data recieved from server
  function handleDataReceived(data){

    // setting the transcribedAudio 
    if(data){
      transcribedAudio.current = data;
      question.current = data;
      
      speechToTextUtils.stopRecording();
      fetchData()
    } else{
      console.log("no data received from server")
    }

    
  }

  async function continueChat(){
    

    if(interacting.current=='true'){
     
      await endTranscription();
      
      speechToTextUtils.initRecording(handleDataReceived,(error) => {
        console.error('Error when transcribing', error);
        // setIsRecording(false)
        //fetchFiller();
        // No further action needed, as stream already closes itself on error
      })
    }  

    //   if(micString=='PAUSE'){
    //     speechToTextUtils.initRecording(handleDataReceived,(error) => {
    //       console.error('Error when transcribing', error);
    //       // setIsRecording(false)

    //       //fetchFiller();

    //       //fetchFiller(); 

    //       // No further action needed, as stream already closes itself on error
    //     })
      
      
    // }
    console.log("still here!")


  }

  async function chatFiller(){
    fetchFiller();
   
    continueChat();
    
  }

  function fetchData(){
      //continueChat();
      //fetchFiller();
      //fetchFiller();
      if(question.current==null || question.current==""){
        setFillerPlaying(true);
        fetchFiller();
      }
      else{
        //endTranscription();
      axios.post(`/api/player`,{
        params:{
          toiaIDToTalk: history.location.state.toiaToTalk,
          toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk,
          question,
          streamIdToTalk: history.location.state.streamToTalk
        }
      }).then((res)=>{
        
        if (res.data === "error"){
          setFillerPlaying(true);
          //fetchFiller();
          //continueChat();
        } else{
          setFillerPlaying(true);
        setVideo(<video className="player-vid" id="vidmain" key={transcribedAudio} onEnded={interacting.current=='false' ? fetchFiller:chatFiller} autoPlay><source src={res.data} onEnded={fetchFiller} type='video/mp4'></source></video>);
        transcribedAudio.current = '';
        
      }});
    }
  }

  function endTranscription(){
    speechToTextUtils.stopRecording();
  }


    function micStatusChange(){
      if(micMute==true){
        setMicStatus(false);
        setMicString('PAUSE');
        setIsInteracting(true)
        interacting.current = 'true';
        //speechToTextUtils.initRecording();
        speechToTextUtils.initRecording(handleDataReceived,(error) => {
          console.error('Error when transcribing', error);
          // setIsRecording(false)
          //fetchFiller();
          // No further action needed, as stream already closes itself on error
        })
        
       
      }else{
        speechToTextUtils.stopRecording();
        setMicStatus(true);
        setMicString('INTERACT');
        setIsInteracting(false)
        interacting.current = 'false';
        
        //continueChat();
      }
    }

    function fetchFiller(){
      //continueChat();
      
      if(fillerPlaying){
        axios.post(`/api/fillerVideo`,{
          params: {
            toiaIDToTalk: history.location.state.toiaToTalk,
            toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk
          }}).then(async (res)=>{
          
          let videoELem=<video muted className="player-vid" id="vidmain" key="filler" onEnded={interacting.current=='false' ? fetchFiller:chatFiller} autoPlay><source src={res.data} type='video/mp4'></source></video>;
          setVideo(videoELem);
          document.getElementById("vidmain").load();
          const playPromise = document.getElementById("vidmain").play();
          if (playPromise !== undefined) {
            playPromise
              .then(_ => {
                // Automatic playback started!
                // Show playing UI.
                console.log("audio played auto");
              })
              .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
                console.log("playback prevented");

                fetchFiller();
              });
          }
          //continueChat();
        });
      }
    }

    function textChange(e){
      textInput.current = e.target.value;
    }

    function submitResponse(e){
      question.current = textInput.current;
      if(question.current!=""){
        // fetchData();

        axios.post(`/api/player`,{

          params:{
            toiaIDToTalk: history.location.state.toiaToTalk,
            toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk,
            question,
            streamIdToTalk: history.location.state.streamToTalk
          }
        }).then((res)=>{
         
          if (res.data === "error"){
            setFillerPlaying(true);
            //fetchFiller();
            //continueChat();
          } else{
            setFillerPlaying(true);
          setVideo(<video className="player-vid" id="vidmain" key={transcribedAudio} onEnded={fetchFiller} autoPlay><source src={res.data} onEnded={fetchFiller} type='video/mp4'></source></video>);
          transcribedAudio.current = '';
          question.current = '';
        }})
      }
    }

    function submitHandler(e){
      e.preventDefault();

      let params={
          email:input1,
          pwd:input2
      }

      axios.post(`/api/login`,params).then(res=>{
          if(res.data==-1){
              //alert('Email not found');
              NotificationManager.error("Incorrect e-mail address.");
          }else if(res.data==-2){
              NotificationManager.error("Incorrect password.");
          }else {
              console.log(res.data);
              history.push({
                  pathname: '/mytoia',
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
        endTranscription();
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
        endTranscription();
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
        endTranscription();
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
        endTranscription();
          history.push({
          pathname: '/mytoia',
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
         endTranscription();
    }

   function signup(){
      history.push({
        pathname: '/signup',
      });
      endTranscription();
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
        { (micMute) ? (
          <button color='green' className = "ui green microphone button mute-button" onClick={micStatusChange}><i aria-hidden="true" class="microphone icon"></i>{micString}</button>
        ):(
          <button  className = "ui secondary button mute-button" onClick={micStatusChange}><i aria-hidden="true" class="microphone slash icon"></i>{micString}</button>

        )}

        
        
        
        {/* <button className = "skip-end-button" >Skip to End </button> */}

        <div>
        { (micMute) ? (
           <><input
              className="type-q font-class-1"
              placeholder={'Type text here!'}
              // value={''}
              // defaultValue= 'Type text here!'
              id="video-text-box"
              type={"text"}
              onChange={textChange} /><button color='green' className="ui primary button submit-button" onClick={submitResponse}><i aria-hidden="true" class="send icon"></i>SEND</button></>
         
        ):(
          <input
          className="type-q font-class-1"
          placeholder={"Transcript"}
          value={transcribedAudio.current || ''}
          id="video-text-box"
          type={"text"}
          //onChange={setQuestionValue}
      />

        )}
        {/* <input
              className="type-q font-class-1"
              placeholder={"Transcript"}
              value={transcribedAudio.current || ''}
              id="video-text-box"
              type={"text"}
              //onChange={setQuestionValue}
          /> */}

      </div>

      </div>
      <NotificationContainer/>
    </div>
  )
}

export default Player;
