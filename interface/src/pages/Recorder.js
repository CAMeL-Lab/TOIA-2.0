import './App.css';
import './Recorder.css';
import 'semantic-ui-css/semantic.min.css';
import React,  {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
import Switch from "react-switch";

const videoConstraints = {
  width: 720,
  height: 405,
  facingMode: "user"
};

function Recorder () {

  function exampleReducer( state, action ) {
    switch (action.type) {
      case 'close':
        return { open: false };
      case 'open':
        return { open: true }; 
    }
  }
  
  const { transcript, resetTranscript } = useSpeechRecognition({command: '*'});

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [toiaName, setName] = useState(null);
  const [toiaLanguage, setLanguage] = useState(null);
  const [toiaID, setTOIAid] = useState(null);

  // const [questionList,setQuestionList]=useState([]);
  const [recordedVideo,setRecordedVideo]=useState();
  const [videoType,setVideoType]=useState(null);
  const [questionSelected,setQuestionSelected]=useState(null);
  const [answerProvided,setAnswerProvided]=useState(null);
  const [isPrivate,setPrivacySetting]=useState(false);
  const [listStreams, setListStreams]=useState([]);
  const [allStreams, setAllStreams]=useState([]);
  const [videoPlayback,setVideoComponent]=useState(null);

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
  const { open } = state

  const [bgColor1, setColor1] = useState('#e5e5e5');
  const [bgColor2, setColor2] = useState('#e5e5e5');
  const [bgColor3, setColor3] = useState('#e5e5e5');
  const [bgColor4, setColor4] = useState('#e5e5e5');
  const [bgColor5, setColor5] = useState('#e5e5e5');
  const [bgSwitch, setSwitch] = useState('#e5e5e5');

  const handleChange = nextChecked => {
    console.log(isPrivate);
    if (bgSwitch == '#e5e5e5'){
      setSwitch('#7E7C7C');
      setPrivacySetting(true);
    }else{
      setSwitch('#e5e5e5');
      setPrivacySetting(false);
    }
  };

  useEffect(() => {
    // axios.get('http://localhost:3000/getAllVideos').then((res)=>{
    //   setQuestionList(res.data);
    // });
    setName(history.location.state.toiaName);
    setLanguage(history.location.state.toiaLanguage);
    setTOIAid(history.location.state.toiaID);

    axios.post('http://localhost:3000/getUserStreams',{
      params:{
          toiaID: history.location.state.toiaID
      }
    }).then((res)=>{
      let streamsReceived=[];
      console.log("got daata");
      res.data.forEach((stream)=>{
        streamsReceived.push(stream.name);
      });
      setAllStreams(streamsReceived);
    });
  
  },[]);

  const handleStartCaptureClick = React.useCallback((e) => {
    SpeechRecognition.startListening({ continuous: true });
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
    e.preventDefault();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback((e) => {
  
    SpeechRecognition.stopListening();
    mediaRecorderRef.current.stop();
    setCapturing(false);
    e.preventDefault();
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  function handleDownload(e){
    e.preventDefault();
    console.log(answerProvided,videoType,questionSelected);

    let form = new FormData();
    form.append('blob', recordedVideo);
    form.append('id',toiaID);
    form.append('name',toiaName);
    form.append('language',toiaLanguage);
    form.append('question', questionSelected);
    form.append('answer', answerProvided);
    form.append('videoType', videoType);
    form.append('private', isPrivate);
    form.append('streams', listStreams);
  
    axios.post('http://localhost:3000/recorder',form);
    // .then((nextQuestion)=>{
    //   const findQuestion = (element)=>element==questionSelected;
    //   let qIndex=questionList.findIndex(findQuestion);
    //   questionList[qIndex]=nextQuestion.data;
      
    // });

    // axios({
    //   method: 'post',
    //   url: 'http://localhost:3000/recorder',
    //   data: {
    //     body: form, // This is the body part
    //   }
    // });



    // const a = document.createElement("a");
    // a.style = "display: none";
    // a.href = url;
    // a.download = inputName+".mp4";
    // a.click();
    resetTranscript();
    setRecordedChunks([]);
    dispatch({ type: 'close' });

    // for( var i=0; i < albumC.length; i++){
    //   albumSelect.push(albumC[i].label);
    // }
  
  };
  
  const openModal=React.useCallback((e)=>{
    e.preventDefault();
    if (questionSelected == null){
      alert("Please choose a question before submitting your response.");
    } else if (videoType==null){
      alert("Please choose a video type before submitting your response.");
    } else{
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, {
          type: "video/webm"
        });
        setRecordedVideo(blob);

        let videoElem= <video id="playbackVideo" width="720" height="405" autoPlay controls><source src={window.URL.createObjectURL(blob)} type='video/mp4'></source></video>;
        setVideoComponent(videoElem);
        // document.getElementById("videoRecorded").src = window.URL.createObjectURL(blob);
        setAnswerProvided(transcript);
        dispatch({ type: 'open' });
      } else{
        alert("Please record a video clip before submitting your response.");
      }
    }
  },[recordedChunks]);

  function handleClose(e){
    e.preventDefault();
    setVideoComponent(null);
    setRecordedChunks([]);
    dispatch({ type: 'close' });
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

  function garden() {
    history.push({
        pathname: '/garden',
    });
  }
 
  function changecolor(event) {
    event.preventDefault();
    var name = event.target.className;

    console.log(videoType);
    console.log(allStreams);


    switch(name) {
      case "side-button b1":
        if (bgColor1 == '#e5e5e5'){
          setColor1('#7E7C7C');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setVideoType('filler');
        }else{
          setColor1('#e5e5e5');
          setVideoType(null);
        }
        break;
      case "side-button b2":
        if (bgColor2 == '#e5e5e5'){
          setColor2('#7E7C7C');
          setColor1('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setVideoType('answer');
        }else{
          setColor2('#e5e5e5');
          setVideoType(null);
        }
        break;
      case "side-button b3":
        if (bgColor3 == '#e5e5e5'){
          setColor3('#7E7C7C');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setVideoType('y/n-answer');
        }else{
          setColor3('#e5e5e5');
          setVideoType(null);
        }
        break;
      case "side-button b4":
        if (bgColor4 == '#e5e5e5'){
          setColor4('#7E7C7C');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor5('#e5e5e5');
          setVideoType('greeting');
        }else{
          setColor4('#e5e5e5');
          setVideoType(null);
        }
        break;
      case "side-button b5":
        if (bgColor5 == '#e5e5e5'){
          setColor5('#7E7C7C');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setVideoType('exit');
        }else{
          setColor5('#e5e5e5');
          setVideoType(null);
        }
        break;
    }
  }

  // function setStream(event){
  //   // event.preventDefault();
  //   setListStreams(listStreams => [...listStreams, event.target.value]);
  // }
  
  function logout(){
      //logout function needs to be implemented (wahib)
      history.push({
          pathname: '/',
        });
  }

  const customStyles = {
    option: (styles, { isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? null
          : isSelected
          ? '#7E7C7C'
          : isFocused
          ? '#7E7C7C'
          : null,
        ':active': {
          ...styles[':active'],
          backgroundColor:
            !isDisabled && (isSelected ? '#7E7C7C' : null),
        },
      };
    },
    control: styles => ({ ...styles, backgroundColor: 'rgba(126, 124, 124, 0.1)' }),
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: '#e5e5e5',
      };
    },
  };

  return (
    <form className="record-page" name="form1" action="form1" >
      <Modal //this is the new pop up menu
      
      size='large'
      style={{height: "80%",width: "70%", top:"5%", alignContent:"center"}}
      open={open} 
      onClose={handleClose}
      >
          <Modal.Header className="modal-header">
            <div>Do you want to save this video entry? </div>
            </Modal.Header>
          <Modal.Content>
          <div id="typeOfVideo">Video Type: {videoType}</div>
          {videoPlayback}
          {/* <video id="videoRecorded"></video> */}
          <div id="answerCorrection">Feel free to correct your answer below:</div>
          <div contentEditable="true" className="modal-ans font-class-1" onChange={e=>setAnswerProvided(e.target.value)}>{answerProvided}
          </div>
          </Modal.Content>
          <Modal.Actions>
          <Button color='green' inverted onClick={handleDownload}>
              <i class="fa fa-check"></i>
          </Button>
          </Modal.Actions>
      </Modal>
      <div className="nav-heading-bar">
          <div onClick={home} className="nav-toia_icon app-opensans-normal">
              TOIA
          </div>
          <div onClick={about} className="nav-about_icon app-monsterrat-black">
              About Us
          </div>
          <div onClick={library} className="nav-talk_icon app-monsterrat-black ">
              Talk To TOIA
          </div>
          <div onClick={garden} className="nav-my_icon app-monsterrat-black ">
              My TOIA
          </div>
          <div onClick={logout}className="nav-login_icon app-monsterrat-black ">
              Logout
          </div>
      </div>
      <h1 className="title font-class-3 ">Recorder</h1>            
      <div>
        <div className="side-bar">
          <div className="side-button b1" style={{backgroundColor: bgColor1}} onClick={changecolor}>Filler</div>
          <div className="side-button b2" style={{backgroundColor: bgColor2}} onClick={changecolor}>Regular Answer</div>
          <div className="side-button b3" style={{backgroundColor: bgColor3}} onClick={changecolor}>Yes or No</div>
          <div className="side-button b4" style={{backgroundColor: bgColor4}} onClick={changecolor}>Greeting</div>
          <div className="side-button b5" style={{backgroundColor: bgColor5}} onClick={changecolor}>Exit</div>
          <hr className="divider1"></hr>
          <div className="font-class-1 public" style={{backgroundColor: bgSwitch}}>
            <span>Public</span>
            <Switch
              onChange={handleChange}
              checked={isPrivate}
              handleDiameter={28}
              onColor="#FFFFFF"
              onHandleColor="#FFFFFF"
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={54}
              className="switch"
            />
          </div>
          <hr className="divider2"></hr>
          <div className="select">
            <CreatableSelect
                placeholder = "Select album...."
                isClearable
                isMulti
                onChange={(e)=>setListStreams(listStreams => [...listStreams, e.target.value])}
                styles={customStyles}
                options={allStreams}
                value={listStreams}
              />
          </div> 
        </div>
        <Webcam className="layout" audio={true} ref={webcamRef} mirrored={true} videoConstraints={videoConstraints}/>
        {capturing ? (
          <button className="icon" onClick={handleStopCaptureClick}><i class="fa fa-stop" style={{fontSize: 34}}></i></button>
        ) : (
          <button className="icon" onClick={handleStartCaptureClick}><i class="fa fa-video-camera" style={{fontSize: 34}}></i>
          </button>
        )}
        {recordedChunks.length > 0 && (
          <button className="check" onClick={openModal}><i class="fa fa-check"></i></button>
        )}
        <p className="recorder-speech">{transcript}</p>
        <input
          className="type-q font-class-1"
          placeholder={"Type your own question"}
          type={"text"}
          onChange={e=>setQuestionSelected(e.target.value)}
        />
      </div>
    </form>
  );
}

export default Recorder;