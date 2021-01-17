import React, {Component} from 'react';
import {useState, useEffect} from 'react';
import axios from 'axios';
import history from '../services/history';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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


  function fetchData(event){

    event.preventDefault();
  
    SpeechRecognition.stopListening();

    let question = transcript[0].toUpperCase()+transcript.slice(1);

    let videoElem= <video width='320' height='240' key={question} autoPlay><source src={`http://localhost:3000/player/${avatarID}/${avatarName}/${language}/${question}`} type='video/mp4'></source></video>;

    setVideo(videoElem);

  }

  return (
    <div>
      <div>{avatarName}</div>
      <div>{language}</div>

      <div>{video}</div>
      <div>{caption}</div>

      <button onClick={()=>{SpeechRecognition.startListening({ continuous: true })}}>Start</button>
      <button onClick={fetchData}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
    </div>
  )
}

export default Player;

