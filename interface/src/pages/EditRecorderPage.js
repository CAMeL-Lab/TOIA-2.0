
import './App.css';
import './EditRecorderPage.css';
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
    width: 750,
    height: 405,
    facingMode: "user"
  };
  
//var vtype = ['filler', 'greeting', 'exit']; // this variable holds the list of the video type choses (return with the same name)
// var privateSet = true;
// var albumSelected = [ // this is the selected albums 
//   {label: "Default", value: "default"},
//   {label: "Personal", value: "personal"},
// ];

function EditRecorder () {

    function exampleReducer( state, action ) {
        switch (action.type) {
          case 'close':
            return { open: false };
          case 'open':
            return { open: true }; 
        }
    }

    const { transcript, resetTranscript } = useSpeechRecognition({command: '*'});

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const { open } = state

    const [bgColor1, setColor1] = useState(vtype.includes('filler') ? '#7E7C7C': '#e5e5e5');
    const [bgColor2, setColor2] = useState(vtype.includes('regular') ? '#7E7C7C': '#e5e5e5');
    const [bgColor3, setColor3] = useState(vtype.includes('y/n') ? '#7E7C7C': '#e5e5e5');
    const [bgColor4, setColor4] = useState(vtype.includes('greeting') ? '#7E7C7C': '#e5e5e5');
    const [bgColor5, setColor5] = useState(vtype.includes('exit') ? '#7E7C7C': '#e5e5e5');
    const [bgSwitch, setSwitch] = useState(privateSet ? '#7E7C7C' : '#e5e5e5');
  
    var albums =[ // this is a lst of all the albums
      {label: "Default", value: "default"},
      {label: "Business", value: "business"},
      {label: "Personal", value: "personal"},
      {label: "Fun", value: "fun"},
      ];
  
    const handleChange = nextChecked => {
      setPublic(nextChecked);
      if (bgSwitch == '#e5e5e5'){
        setSwitch('#7E7C7C');
      }else{
        setSwitch('#e5e5e5');
      }
    };

    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);
    const [videoID,setVideoID]=useState(null);
    const [question,setQuestion]=useState(null);
    const [answer,setAnswer]=useState(null);
    const [videoType,setVideoType]=useState(null);
    const [videoStreams,setVideoStreams]=useState([]);
    const [videoIsPrivate,setIsPrivate]=useState(false);

    React.useEffect(() => {
      setName(history.location.state.toiaName);
      setLanguage(history.location.state.toiaLanguage);
      setTOIAid(history.location.state.toiaID);
      setVideoID(history.location.state.videoID);
      setVideoType(history.location.state.videoType);
      if(history.location.state.videoType!=null){

      }
      setQuestion(history.location.state.question);
      setAnswer(history.location.state.answer);
    });

        /*useEffect(() => {
        axios.get('http://localhost:3000/getQuestions').then((res)=>{
        setQuestionList(res.data);
        });
        setName(history.location.state.name);
        setLanguage(history.location.state.language);
        setAvatarID(history.location.state.new_avatar_ID);
    });
    },[]);*/

    // setName(history.location.state.name);
    // setLanguage(history.location.state.language);


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

    const handleDownload = React.useCallback((e) => {

        if (question == null){
        alert("Cannot submit until a question is chosen or written, ensure that text field is not highlight when submitting");
        } else {

        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
            type: "video/webm"
            });

            let form = new FormData();
            form.append('blob', blob);
            form.append('id',toiaID);
            form.append('name',toiaName);
            form.append('language',toiaLanguage);
            form.append('question', question);
            form.append('answer', transcript);
            console.log(form);
            axios.post('http://localhost:3000/recorder',form).then(()=>{
              history.push({
                pathname: '/garden',
              });
            });

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

            for( var i=0; i < albumC.length; i++){
              albumSelect.push(albumC[i].label);
            }
        }
      }
        e.preventDefault();
    }, [recordedChunks]);


    function openModal(e){
        dispatch({ type: 'open' });
        e.preventDefault();
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

      function setType(event){
        event.preventDefault();
        if(videoType!=null){

        }else{
          setVideoType(e.)
        }
      }
     
      function changecolor(event) {
        event.preventDefault();
        var name = event.target.className;
    
        switch(name) {
          case "side-button b1":
            if (bgColor1 == '#e5e5e5'){
              setColor1('#7E7C7C');
              vtype.push('filler');
            }else{
              setColor1('#e5e5e5');
              vtype.splice(vtype.indexOf('filler'), 1);
            }
            break;
          case "side-button b2":
            if (bgColor2 == '#e5e5e5'){
              setColor2('#7E7C7C');
              vtype.push('regular');
            }else{
              setColor2('#e5e5e5');
              vtype.splice(vtype.indexOf('regular'), 1);
            }
            break;
          case "side-button b3":
            if (bgColor3 == '#e5e5e5'){
              setColor3('#7E7C7C');
              vtype.push('y/n');
            }else{
              setColor3('#e5e5e5');
              vtype.splice(vtype.indexOf('y/n'), 1);
            }
            break;
          case "side-button b4":
            if (bgColor4 == '#e5e5e5'){
              setColor4('#7E7C7C');
              vtype.push('greeting');
            }else{
              setColor4('#e5e5e5');
              vtype.splice(vtype.indexOf('greeting'), 1);
            }
            break;
          case "side-button b5":
            if (bgColor5 == '#e5e5e5'){
              setColor5('#7E7C7C');
              vtype.push('exit');
            }else{
              setColor5('#e5e5e5');
              vtype.splice(vtype.indexOf('exit'), 1);
            }
            break;
        }
      }

      // function renderTypeButtons(){
      //   return
      // }
      
      function logout(){
          //logout function needs to be implemented (wahib)
          history.push({
              pathname: '/',
            });
      }
    
    const inlineStyle = {
        modal : {
            height: '400px',
            width: '800px',
        }
      };
    
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
        <form className="edit-record-page">
            <Modal //this is the new pop up menu
            closeIcon={true}
            size='large'
            style={inlineStyle.modal}
            open={open} 
            onClose={() => dispatch({ type: 'close' })}
            >
                <Modal.Header className="edit-modal-header">Feel free to correct your answer!</Modal.Header>
                <Modal.Content>

                <div contentEditable="true" className="edit-modal-ans edit-modal-text" onChange={e=>setAnswer(e.target.value)}>{transcript}
                </div>
                </Modal.Content>
                <Modal.Actions>
                <Button color='green' inverted>
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
            <h1 className="edit-title edit-font-class-3 ">Edit Recording</h1>
            <div className="side-bar">
                <div className="side-button b1" value="filler" id="filler" style={{backgroundColor: bgColor1}} onClick={setType}>Filler</div>
                <div className="side-button b2" value="answer" id="answer" style={{backgroundColor: bgColor2}} onClick={setType}>Regular Answer</div>
                <div className="side-button b2" value="no-answer" id="no-answer" style={{backgroundColor: bgColor2}} onClick={setType}>No Answer Provided</div>
                <div className="side-button b3" value="y/n-answer" id="y/n-answer" style={{backgroundColor: bgColor3}} onClick={setType}>Yes or No</div>
                <div className="side-button b4" value="greeting" id="greeting" style={{backgroundColor: bgColor4}} onClick={setType}>Greeting</div>
                <div className="side-button b5" value="exit" id="exit" style={{backgroundColor: bgColor5}} onClick={setType}>Exit</div>
                <hr className="divider1"></hr>
                <div className="font-class-1 public" style={{backgroundColor: bgSwitch}}>
                <span>Public</span>
                <Switch
                    onChange={handleChange}
                    checked={isPublic}
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
                    onChange={setAlbum}
                    styles={customStyles}
                    options={albums}
                    value={albumC}
                    />
                </div> 
            </div>
            <Webcam className="edit-layout" audio={true} ref={webcamRef} mirrored={true} videoConstraints={videoConstraints}/>
            {capturing ? (
                <button className="edit-icon" onClick={handleStopCaptureClick}><i class="fa fa-stop" style={{fontSize: 34}}></i></button>
            ) : (
                <button className="edit-icon" onClick={handleStartCaptureClick}><i class="fa fa-video-camera" style={{fontSize: 34}}></i></button>
            )}
            {recordedChunks.length > 0 && (
                <button className="edit-check" onClick={openModal}><i class="fa fa-check"></i></button>
            )}
            <p className="speech">{transcript}</p>
            <input
                className="edit-type-q edit-font-class-1"
                defaultValue={question}
                type={"text"}
                onChange={e=>setQuestion(e.target.value)}
            />
        </form>
    );
}

export default EditRecorder;