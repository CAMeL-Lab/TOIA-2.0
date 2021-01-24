import React, {Component} from 'react';
import {useState, useEffect} from 'react';
import axios from 'axios';
import backButton from "../icons/back-button.svg";
import history from '../services/history';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css'
import './Player.css';

function Player(){
  const { transcript, resetTranscript } = useSpeechRecognition({command: '*',callback:fetchData});
  
  const [avatarName, setAvatarName] = React.useState(null);
  const [language, setLanguage] = React.useState(null);
  const [interactionLanguage,setInteractionLanguage] = useState(null);
  const [avatarID,setAvatarID] = React.useState(null);
  const [video,setVideo] = useState(null);
  const [caption,setCaption] = useState(null);

  React.useEffect(() => {
    setAvatarName(history.location.state.name);
    setLanguage(history.location.state.language);
    setInteractionLanguage(history.location.state.interactionLanguage);
    setAvatarID(history.location.state.avatarID);
  });

  function goBack(){
    history.goBack();
  }

  function fetchData(event){

    event.preventDefault();
  
    SpeechRecognition.stopListening();

    let question = transcript[0].toUpperCase()+transcript.slice(1);

    let videoElem= <video className="player-vid" key={question} autoPlay><source src={`http://localhost:3000/player/${avatarID}/${avatarName}/${language}/${question}`} type='video/mp4'></source></video>;

    setVideo(videoElem);

  }

  return (
    <div className="player">
      <div onClick={goBack}><img className="player-back_icon" src={backButton} /></div>

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

