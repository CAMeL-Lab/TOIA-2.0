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

  //const [question,setQuestion] = useState(null);
  //const [matched,setMatched]=useState(0);

  //const [transcribedAudio, setTranscribedAudio] = useState("");

  const transcribedAudio = React.useRef(null);
  const question = React.useRef(null);


  var input1, input2;
  let [micMute, setMicStatus]=React.useState(false);
  let [micString, setMicString]=React.useState('Mute');

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
    continueChat();

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
  var cont = false;
  let cancelToken;

  //const controller = new AbortController();

  function continueChat(){
    if (typeof cancelToken != typeof undefined) {
      endTranscription()
      cancelToken.cancel("Operation canceled due to new request.")
    }

    cancelToken = axios.CancelToken.source()
    setFillerPlaying(true);
    
    // requesting the server to start listening
    console.log("request sent")
    axios.post(`/transcribeAudio`, {
      params: {
          toiaID: history.location.state.toiaID,
          fromRecorder: false
      }
    }, { cancelToken: cancelToken.token }).then((res)=>{
      transcribedAudio.current=res.data;
      //setTranscribedAudio(newData);
      //setQuestion(res.data);
      question.current = res.data;
      console.log("transcribed audio in res.data= ", transcribedAudio.current);
      console.log("question = ", question.current);
      fetchData();
      return;
    }).catch((err) =>{
      console.log(err)
    })

  }

  function fetchData(){
      //continueChat();
      //fetchFiller();
      //fetchFiller();
      console.log("transcribedAudio in fetch data", transcribedAudio.current);
      console.log("question in current", question.current)
      if(question.current==null || question==""){
        setFillerPlaying(true);
        fetchFiller();
      }
      else{
        //endTranscription();
      axios.post(`/player`,{
        params:{
          toiaIDToTalk: history.location.state.toiaToTalk,
          toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk,
          question,
          streamIdToTalk: history.location.state.streamToTalk
        }
      }).then((res)=>{
        console.log("this is res.data: ", res.data);
        if (res.data === "error"){
          setFillerPlaying(true);
          fetchFiller();
          //continueChat();
        } else{
          setFillerPlaying(false);
        setVideo(<video className="player-vid" id="vidmain" key={transcribedAudio} onEnded={fetchFiller} autoPlay><source src={res.data} onEnded={fetchFiller} type='video/mp4'></source></video>);
        console.log("video here")
        //resetTranscript();
        //setTranscribedAudio("")
        //continueChat();
        //fetchFiller();
      }});
    }
  }

  function endTranscription(){

    axios.post(`/endTranscription`, {
      params: {
          toiaID: history.location.state.toiaID
      }
    }).then((res)=>{
      console.log("transcription ended!")
      return;
    })
  }


    function micStatusChange(){
      if(micMute==true){
        setMicStatus(false);
        setMicString('Mute');
        SpeechRecognition.startListening();
      }else{
        SpeechRecognition.stopListening();
        setMicStatus(true);
        setMicString('Unmute');
        fetchData();
      }
    }

    function fetchFiller(){
      if(fillerPlaying){
        axios.post(`/fillerVideo`,{
          params: {
            toiaIDToTalk: history.location.state.toiaToTalk,
            toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk
          }
        }).then(async (res)=>{
          console.log("filler playing again here")
          
          let videoELem=<video muted className="player-vid" id="vidmain" key="filler" onEnded={fetchFiller} autoPlay><source src={res.data} type='video/mp4'></source></video>;
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
          continueChat();
        });
      }
    }

    function submitHandler(e){
      e.preventDefault();

      let params={
          email:input1,
          pwd:input2
      }

      axios.post(`/login`,params).then(res=>{
          if(res.data==-1){
              //alert('Email not found');
              alert("Incorrect e-mail address.");
          }else if(res.data==-2){
              alert("Incorrect password.");
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
      endTranscription();
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
      endTranscription();
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
      endTranscription();
    }

    function garden(e) {
      if (isLoggedIn) {
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
      endTranscription();
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
        
        <button className = "mute-button" onClick={micStatusChange}>{micString}</button>
        
        <button className = "skip-end-button" >Skip to End </button>

        <div>
        <input
              className="type-q font-class-1"
              placeholder={"Transcript"}
              value={transcribedAudio.current || ''}
              id="video-text-box"
              type={"text"}
              //onChange={setQuestionValue}
          />

      </div>

      </div>
      
    </div>
  )
}

export default Player;
