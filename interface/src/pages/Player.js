import React, {Component} from 'react';
import {useState, useEffect} from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function Player(){
  const { transcript, resetTranscript } = useSpeechRecognition({command: '*',callback:fetchData});

  const [language,setLanguage] = useState('English');
  const [avatar,setAvatar] = useState('Margarita');
  const [video,setVideo] = useState('');
  const [caption,setCaption] = useState('');

  function fetchData(event){

    event.preventDefault();
  
    SpeechRecognition.stopListening();

    let question = transcript[0].toUpperCase()+transcript.slice(1);

    let videoElem= <video width='320' height='240' key={question} autoPlay><source src={`http://localhost:3000/player/${avatar}/${language}/${question}`} type='video/mp4'></source></video>;

    console.log(videoElem);

    setVideo(videoElem);

  }

  return (
    <div>
      <div>{avatar}</div>
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

