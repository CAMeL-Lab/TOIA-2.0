import './App.css';
import './Recorder.css';
import 'semantic-ui-css/semantic.min.css';
import React,  {useState, useEffect, useRef, createRef} from "react";
import Webcam from "react-webcam";
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
import { Multiselect } from 'multiselect-react-dropdown';
import Switch from "react-switch";
import env from './env.json';
// import { Navbar, NavItem, NavDropdown, MenuItem, Nav, Container } from 'react-bootstrap';
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import test_video from "../video/TOIA-LOGO-VID.mov"

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
  const [videoTypeFormal,setVideoTypeFormal]=useState(null);
  const [questionSelected,setQuestionSelected]=useState(null);
  const [answerProvided,setAnswerProvided]=useState(null);
  const [isPrivate,setPrivacySetting]=useState(true);
  const [privacyText,setPrivacyText]=useState("Private");
  const [allStreams, setAllStreams]=useState([]);
  const [listStreams, setListStreams]=useState([]);
  const [mainStreamVal, setMainStreamVal]=useState([]);
  const [videoPlayback,setVideoComponent]=useState(null);
  const [videoThumbnail, setVideoThumbnail]=useState('');

  const [editVideoID,setEditVideoID]=useState('');

  const videoTypes={
    'greeting':'Hello!',
    'exit':'Bye!',
    'answer':'Answer',
    'y/n-answer':'Yes/No!',
    'filler':'Filler'
  }

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
  const { open } = state

  const [bgColor1, setColor1] = useState('#e5e5e5');
  const [bgColor2, setColor2] = useState('#e5e5e5');
  const [bgColor3, setColor3] = useState('#e5e5e5');
  const [bgColor4, setColor4] = useState('#e5e5e5');
  const [bgColor5, setColor5] = useState('#e5e5e5');
  const [bgColor6, setColor6] = useState('#e5e5e5');
  const [bgSwitch, setSwitch] = useState('#e5e5e5');

  const handleChange = nextChecked => {
    if (bgSwitch == '#e5e5e5'){
      setSwitch('#b1f7b0');
      setPrivacySetting(false);
      setPrivacyText('Public');
    }else{
      setSwitch('#e5e5e5');
      setPrivacySetting(true);
      setPrivacyText('Private');

    }
  };

  useEffect(() => {
    if(history.location.state==undefined){
      history.push({
          pathname: '/'
      });
    }
    // axios.get('http://localhost:3000/getAllVideos').then((res)=>{
    //   setQuestionList(res.data);
    // });
    setName(history.location.state.toiaName);
    setLanguage(history.location.state.toiaLanguage);
    setTOIAid(history.location.state.toiaID);

    if(history.location.state.videoID!=null){
      let videoTypeEdit=history.location.state.videoType;
      setVideoType(videoTypeEdit);
      setVideoTypeFormal(videoTypes.videoTypeEdit);
      setQuestionSelected(history.location.state.videoType);
    }
    console.log(history.location.state.suggestedQuestion);
    if(history.location.state.suggestedQuestion!=null){
      console.log('party');
      setQuestionSelected(history.location.state.suggestedQuestion);
      document.getElementById('video-text-box').value=history.location.state.suggestedQuestion;
    }

    axios.post(`${env['server-url']}/getUserStreams`,{
      params:{
          toiaID: history.location.state.toiaID
      }
    }).then((res)=>{
      console.log(res.data);
      let streamsReceived=[];
      console.log("got daata");
      res.data.forEach((stream)=>{
        streamsReceived.push({name: stream.name,id:stream.id_stream});
      });
      setAllStreams(streamsReceived);
      setListStreams([streamsReceived[0]]);
      setMainStreamVal([streamsReceived[0]]);
    });

    console.log(history.location.state.toiaName);
    console.log(history.location.state.toiaLanguage);
    console.log(history.location.state.toiaID);


  },[]);

  const handleStartCaptureClick = React.useCallback((e) => {
    resetTranscript();
    setRecordedChunks([]);
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
    console.log(questionSelected);
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

    let form = new FormData();

    form.append('blob', recordedVideo);
    form.append('thumb',videoThumbnail);
    form.append('id',toiaID);
    form.append('name',toiaName);
    form.append('language',toiaLanguage);
    form.append('question', questionSelected);
    form.append('answer', answerProvided);
    form.append('videoType', videoType);
    form.append('private', isPrivate);
    form.append('streams', JSON.stringify(listStreams));

    axios.post(`${env['server-url']}/recorder`,form);

    resetTranscript();
    setRecordedChunks([]);
    setVideoThumbnail('');
    dispatch({ type: 'close' });

    setSwitch('#e5e5e5');
    setPrivacySetting(true);
    setPrivacyText('Private');

    setColor1('#e5e5e5');
    setColor2('#e5e5e5');
    setColor3('#e5e5e5');
    setColor4('#e5e5e5');
    setColor5('#e5e5e5');
    setColor6('#e5e5e5');
    setVideoType(null);
    setVideoTypeFormal(null);

    setQuestionSelected(null);
    document.getElementById('video-text-box').value="";

    // .then((nextQuestion)=>{
    //   const findQuestion = (element)=>element==questionSelected;
    //   let qIndex=questionList.findIndex(findQuestion);
    //   questionList[qIndex]=nextQuestion.data;

    // });


    // for( var i=0; i < albumC.length; i++){
    //   albumSelect.push(albumC[i].label);
    // }

  };

  function openModal(event){
    console.log(listStreams,isPrivate,questionSelected,answerProvided);
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
        // the ratio we are using is 16:9 or the universal high definition standard for european television
        let videoElem= <video id="playbackVideo" width="496" height="324" autoPlay controls><source src={window.URL.createObjectURL(blob)} type='video/mp4'></source></video>;
        setVideoComponent(videoElem);
        // document.getElementById("videoRecorded").src = window.URL.createObjectURL(blob);
        setAnswerProvided(transcript);
        dispatch({ type: 'open' });
      } else{
        alert("Please record a video clip before submitting your response.");
      }
    }
    event.preventDefault();
  }

  function exampleReducer2( state2, action ) { // for account settings window
      switch (action.type) {
        case 'close':
          return { open2: false };
        case 'open':
          return { open2: true };
      }
  }
  const [state2, dispatch2] = React.useReducer(exampleReducer2, {open2: false,})
  const { open2 } = state2

  function openModal2(e){
      dispatch2({ type: 'open' });
      e.preventDefault();
  }

  function handleClose(e){
    e.preventDefault();
    setVideoComponent(null);
    setRecordedChunks([]);
    dispatch({ type: 'close' });
  }

  function home() {
    history.push({
      pathname: '/',
      state: {
        toiaName,
        toiaLanguage,
        toiaID
      }
    });
}

  function about() {
    history.push({
      pathname: '/about',
      state: {
        toiaName,
        toiaLanguage,
        toiaID
      }
    });
  }

  function library() {
    history.push({
      pathname: '/library',
      state: {
        toiaName,
        toiaLanguage,
        toiaID
      }
    });
  }

  function garden() {
    history.push({
        pathname: '/mytoia',
        state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
    });
}

  function changecolor(event) {
    event.preventDefault();
    var name = event.target.className;

    switch(name) {
      case "side-button b1 tooltip":
        if (bgColor1 == '#e5e5e5'){
          setColor1('#b1f7b0');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setColor6('#e5e5e5');
          setVideoType('greeting');
          setVideoTypeFormal('Hello!')
        }else{
          setColor1('#e5e5e5');
          setVideoType(null);
          setVideoTypeFormal(null);
        }
        break;
      case "side-button b2 tooltip":
        if (bgColor2 == '#e5e5e5'){
          setColor2('#b1f7b0');
          setColor1('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setColor6('#e5e5e5');
          setVideoType('exit');
          setVideoTypeFormal('Bye!')

        }else{
          setColor2('#e5e5e5');
          setVideoType(null);
          setVideoTypeFormal(null);
        }
        break;
      case "side-button b3 tooltip":
        if (bgColor3 == '#e5e5e5'){
          setColor3('#b1f7b0');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor4('#e5e5e5');
          setColor5('#e5e5e5');
          setColor6('#e5e5e5');
          setVideoType('answer');
          setVideoTypeFormal('Answer')
        }else{
          setColor3('#e5e5e5');
          setVideoType(null);
          setVideoTypeFormal(null);
        }
        break;
      case "side-button b4 tooltip":
        if (bgColor4 == '#e5e5e5'){
          setColor4('#b1f7b0');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor5('#e5e5e5');
          setColor6('#e5e5e5');
          setVideoType('y/n-answer');
          setVideoTypeFormal('Yes/No!')
        }else{
          setColor4('#e5e5e5');
          setVideoType(null);
          setVideoTypeFormal(null);
        }
        break;
      case "side-button b5 tooltip":
        if (bgColor5 == '#e5e5e5'){
          setColor5('#b1f7b0');
          setColor1('#e5e5e5');
          setColor2('#e5e5e5');
          setColor3('#e5e5e5');
          setColor4('#e5e5e5');
          setColor6('#e5e5e5');
          setVideoType('filler');
          setVideoTypeFormal('Filler')
          setQuestionSelected('Filler video!');

        }else{
          setColor5('#e5e5e5');
          setVideoType(null);
          setVideoTypeFormal(null);
        }
        break;
      case "side-button b6 tooltip":
      if (bgColor6 == '#e5e5e5'){
        setColor6('#b1f7b0');
        setColor1('#e5e5e5');
        setColor2('#e5e5e5');
        setColor3('#e5e5e5');
        setColor4('#e5e5e5');
        setColor5('#e5e5e5');
        setVideoType('answer');
        setVideoTypeFormal('What?')
      }else{
        setColor6('#e5e5e5');
        setVideoType(null);
        setVideoTypeFormal(null);
      }
      break;
    }
  }

  function setQuestionValue(event){
    setQuestionSelected(event.target.value);
  }

  function setAnswerValue(event){
    setAnswerProvided(event.target.value);
    console.log(answerProvided);
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

//   const tooltipStyles = StyleSheet.create({
//     bold: {fontWeight: 'bold'},
//     italic: {fontStyle: 'italic'},
//     underline: {textDecorationLine: 'underline'}
// })
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

  const inlineStyleSetting = {
      modal : {
          height: '85vh',
          width: '65vw',
      }
  };

  //code for webcam for Thumbnail
  const WebcamComponent = () => <Webcam />;

const thumbnail_videoConstraints = {
    width: 262.5,
    height: 315,
    facingMode: "user"
};

 const WebcamCapture = () => {


    const webcamRef = React.useRef(null);

    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setVideoThumbnail(imageSrc)
        });


    return (
        <div className="webcam-container">
            <div className="webcam-img">

                {videoThumbnail == '' ? <Webcam
                    audio={false}
                    height={315}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={262.5}
                    videoConstraints={thumbnail_videoConstraints}
                    borderRadius = {5}
                /> : <img src={videoThumbnail} />}
            </div>
            <div>
                {videoThumbnail != '' ?
                    <button onClick={(e) => {
                        e.preventDefault();
                        setVideoThumbnail('');
                    }}
                        className="webcam-btn">
                        Retake Image</button> :
                    <button onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="webcam-btn">Capture</button>
                }
            </div>
        </div>
    );
};

// const ffmpeg = createFFmpeg({ log: true });
//
// const [ready, setReady] = useState(false);
// const [video, setVideo] = useState();
// const [gif, setGif] = useState();
//
//
// const load = async () => {
//   await ffmpeg.load();
//   setReady(true);
// };
//
// useEffect(() => {
//   load();
// }, []);
//
// const convertToGif = async () => {
//   ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(test_video));
//   await ffmpeg.run(
//     "-i",
//     "video1.mp4",
//     "-t",
//     "2.5",
//     "-f",
//     "gif",
//     "out.gif"
//   );
//   const data = ffmpeg.FS("readFile", "out.gif");
//   const url = URL.createObjectURL(
//     new Blob([data.buffer], { type: "image/gif" })
//   );
//   setGif(url);
//
// };


  return (
    <form className="record-page" name="form1" action="form1" >
      <Modal //this is the new pop up menu

      size='large'
      style={{position: "absolute", height: "80%",width: "896px", top:"1.5%", alignContent:"center"}}
      open={open}
      onClose={handleClose}
      >
          <Modal.Header className="modal-header">
            <div>Do you want to save this video entry? </div>
            </Modal.Header>
          <Modal.Content>
          <div id="typeOfVideo">Video Type: {videoTypeFormal}</div>
          <div id="questionOfVideo">Question being answered: "{questionSelected}"</div>
          <div id="privacyOfVideo">Privacy Settings: {privacyText}</div>
          <div id="video_thumbnail"><button onClick={(event)=> {openModal2(event)}}>{videoThumbnail=='' ? "Click to create a thumbnail!" : "Click to edit your thumbnail!"}</button></div>
          <div id="divider"></div>
          {videoPlayback}
          {/* <video id="videoRecorded"></video> */}
          <div id="answerCorrection">Feel free to correct your answer below:</div>
          <input
            className="modal-ans font-class-1"
            placeholder={answerProvided}
            value={answerProvided}
            type={"text"}
            onChange={setAnswerValue}
          />
          {/* <div contentEditable="true" className="modal-ans font-class-1" onChange={setAnswerValue}>{answerProvided}
          </div> */}
          </Modal.Content>
          <Modal.Actions>
          <Button color='red' inverted onClick={handleClose} style ={{position: "relative", bottom: "4px"}}>
              {/*<i class="fa fa-check"></i>*/}
              <p>Discard</p>
          </Button>
          <Button color='green' inverted onClick={handleDownload} style ={{position: "relative", bottom: "4px"}}>
              {/*<i class="fa fa-check"></i>*/}
              <p>Save and Re-record</p>
          </Button>
          </Modal.Actions>
      </Modal>
      <Modal //This is the settings pop menu, that shows whenever you delete or move videos
      size='large'
      closeIcon={true}
      style={inlineStyleSetting.modal}
      open={open2}
      onClose={() => dispatch2({ type: 'close' })}
      >
          <Modal.Header className="login_header">
          <h1 className="login_welcome login-opensans-normal">Click a Thumbnail!</h1>
          <p className="login_blurb login-montserrat-black">Add a thumnail for your recorded video</p>
          </Modal.Header>
          <Modal.Content>
              <div className="thumbnail">
              <WebcamCapture/>
              </div>
          </Modal.Content>
          <Modal.Actions>
          <Button color='green' inverted onClick={() => dispatch2({ type: 'close' })}>
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
      {/* <Navbar bg="light" expand="lg">
  <Container>
    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="#home">Home</Nav.Link>
        <Nav.Link href="#link">Link</Nav.Link>
        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
          <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar> */}
      {/* <h1 className="title font-class-3 ">Recorder</h1>             */}
      <div>
        <div className="side-bar">
          <h1 className="title font-class-3 ">Recorder</h1>
          <div className="side-button b1 tooltip" style={{backgroundColor: bgColor1}} onClick={changecolor}>Hello!
            <span class="tooltiptext">
              Video type for initial greetings
              <br/>

              <i class = "tooltipExample">Hi!, Hello!, Marhaba!, Nihao!</i>

            </span>
          </div>
          <div className="side-button b2 tooltip" style={{backgroundColor: bgColor2}} onClick={changecolor}>Bye!
          <span class="tooltiptext">
              Video type for farewell greetings
              <br/>
              <i class = "tooltipExample"> Bye!, Goodbye!, Maa Salama!, Sayonara!</i>
          </span>
          </div>
          <div className="side-button b3 tooltip" style={{backgroundColor: bgColor3}} onClick={changecolor}>Answer
          <span class="tooltiptext">
              Video type for content answers to questions <br/>
              <i class = "tooltipExample"> I love Pizza; My name is Mary.</i>
          </span>
          </div>
          <div className="side-button b4 tooltip" style={{backgroundColor: bgColor4}} onClick={changecolor}>Yes/No
          <span class="tooltiptext">
              Video type for positive/negative answers <br/>
              <i class = "tooltipExample">Yes!, Right!, Yep!, No!, Never!</i>
          </span>
          </div>
          <div className="side-button b5 tooltip" style={{backgroundColor: bgColor5}} onClick={changecolor}>Filler
          <span class="tooltiptext">
              Video type for filler videos that will be used <br/>
              when waiting for the conversant to ask a question <br/>
              <i class = "tooltipExample"> nodding head, smiling, brushing hair, sipping coffee, <br/>
                scratching nose, checking phone, ... </i>"
          </span>
          </div>
          <div className="side-button b6 tooltip" style={{backgroundColor: bgColor6}} onClick={changecolor}>What?
          <span class="tooltiptext">
                Video type for requests for more information<br/>
                <i class = "tooltipExample"> I did not get that; sorry, can you repeat?; <br/>please elaborate?; huh?;<br/>
                You can ask me about my family, my job,<br/> and my artwork...</i>"
          </span>
          </div>

          <hr className="divider1"></hr>
          <div className="font-class-1 public tooltip" style={{backgroundColor: bgSwitch}}>
            <span>Public</span>
            <Switch
              onChange={handleChange}
              checked={!isPrivate}
              handleDiameter={28}
              onColor="#00587A"
              onHandleColor="#FFFFFF"
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={54}
              className="switch"
            />

          <span class="public_tooltip">
          Set the privacy of the specific video
          </span>
          </div>
          {/* <hr className="divider2"></hr> */}
          <div className="select">
              <Multiselect
                options={allStreams} // Options to display in the dropdown
                onSelect={(list,item)=>{setListStreams(list)}} // Function will trigger on select event
                onRemove={(list,item)=>{setListStreams(list)}} // Function will trigger on remove event
                displayValue="name" // Property name to display in the dropdown options
                selectedValues={mainStreamVal}
                disablePreSelectedValues={true}
                placeholder = "Add Stream"
              />
          </div>
        </div>
        <div class="Video-Layout">
        <Webcam className="layout" audio={true} ref={webcamRef} mirrored={true} videoConstraints={videoConstraints}/>
        {capturing ? (
          <button className="icon tooltip" onClick={handleStopCaptureClick}><i class="fa fa-stop" ></i>
          <span class="camera_tooltip">
          Click to stop recording
          </span>
          </button>
        ) : (
          <button className="icon tooltip" onClick={handleStartCaptureClick}><i class="fa fa-video-camera"></i>
          <span class="camera_tooltip">
          Click to start/restart recording
          </span>
          </button>
        )}
        {recordedChunks.length > 0 && (
          <button className="check tooltip" onClick={openModal}><i class="fa fa-check"></i>
          <span class="check_tooltip">
          Save Video
          </span>
          </button>
        )}
        <p className="recorder-speech">{transcript}</p>
        <input
          className="type-q font-class-1"
          placeholder={"Type your own question"}
          value={questionSelected}
          id="video-text-box"
          type={"text"}
          onChange={setQuestionValue}
        />
        </div>

      </div>
    </form>
  );
}

export default Recorder;

// removed this from icon -> style={{fontSize: 34}}
