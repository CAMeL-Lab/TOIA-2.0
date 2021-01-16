import './App.css';
import './Recorder.css';
import 'semantic-ui-css/semantic.min.css';
import React,  {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import recordIcon from "../icons/record_button.svg";
import stopIcon from "../icons/stop_button.svg";
import closeButton from "../icons/close-button.svg";
import menuButton from "../icons/menu2-button.svg";
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import history from '../services/history';
import {Menu, Sidebar, Segment } from 'semantic-ui-react';

const videoConstraints = {
  width: 1400,
  height: 500,
  facingMode: "user"
};

function Recorder () {
  // const history = useHistory();
  useEffect(() => {
    axios.get('http://localhost:3000/getQuestions').then((res)=>{
      setQuestionList(res.data);

    });
  },[]);
  
  const { transcript, resetTranscript } = useSpeechRecognition({command: '*'});

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [questionList,setQuestionList]=useState([]);
  const [videoType,setVideoType]=useState(null);
  const [questionSelected,setQuestionSelected]=useState(null);
  const [answerProvided,setAnswerProvided]=useState(null);

  const [visible, setVisible] = useState(false);

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
    if (questionSelected == null){
      alert("Cannot submit until a question is chosen or written, ensure that text field is not highlight when submitting");
    } else {

      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, {
          type: "video/webm"
        });

        let form = new FormData();
        form.append('blob', blob);
        form.append('question', questionSelected);
        form.append('answer', transcript);

        axios.post('http://localhost:3000/recorder',form);

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
      }
    }
    e.preventDefault();
  }, [recordedChunks]);
  

  function buttonClick(event){
    event.preventDefault();
    setQuestionSelected(event.target.value);
  }

  function close(){
    history.push({
      pathname: '/garden',
    });
  }

  return (
    <form className="record-page" name="form1" action="form1" >

        <>
            <Sidebar.Pushable as={Segment}>
                <Sidebar
                    as={Menu}
                    animation='overlay'
                    icon='labeled'
                    onHide={() => setVisible(false)}
                    vertical
                    visible={visible}
                    width='wide'
                >
                    <Menu.Item>
                        <div className="menu-header">Video Type</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={e=>setVideoType(e.target.value)} className="menu-item">Filler</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={e=>setVideoType(e.target.value)} className="menu-item1">Greeting</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={e=>setVideoType(e.target.value)} className="menu-item2">Exit</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={e=>setVideoType(e.target.value)} className="menu-item3">Regular Answer</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={e=>setVideoType(e.target.value)} className="menu-item4">Answer Y/N</div>
                    </Menu.Item>
                </Sidebar>

                <Sidebar.Pusher dimmed={visible}>
                  <div>
                    <div onClick={close}><img className="close_icon" src={closeButton} /></div>
                    <div onClick={() => setVisible(true)}><img className="menu_icon" src={menuButton} /></div>
                    <Webcam className="layout" audio={true} ref={webcamRef} mirrored={true} videoConstraints={videoConstraints}/>
                    {capturing ? (
                      <button className="icon" onClick={handleStopCaptureClick}><img src={stopIcon}/></button>
                    ) : (
                      <button className="icon" onClick={handleStartCaptureClick}><img src={recordIcon}/></button>
                    )}
                    {recordedChunks.length > 0 && (
                      <button className="check" onClick={handleDownload}><i class="fa fa-check"></i></button>
                    )}
                    <p className="speech">{transcript}</p>
                    <button className="gen-q x1" value={questionList[0]} onClick={buttonClick}>{questionList[0]}</button>
                    <button className="gen-q x2" value={questionList[1]} onClick={buttonClick}>{questionList[1]}</button>
                    <button className="gen-q x3" value={questionList[2]} onClick={buttonClick}>{questionList[2]}</button>
                    <input
                      className="type-q font-class-1"
                      placeholder={"Type your own question"}
                      type={"text"}
                      required={false}
                      onChange={e=>setQuestionSelected(e.target.value)}
                    />
                  </div>
                </Sidebar.Pusher>
              </Sidebar.Pushable>
            </>
    </form>
  );
}

export default Recorder;