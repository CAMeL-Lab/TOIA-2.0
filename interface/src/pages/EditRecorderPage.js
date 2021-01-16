import './App.css';
import './EditRecorderPage.css';
import 'semantic-ui-css/semantic.min.css';
import React from "react";
import Webcam from "react-webcam";
import recordIcon from "../icons/record_button.svg";
import stopIcon from "../icons/stop_button.svg";
import closeButton from "../icons/close-button.svg";
import menuButton from "../icons/menu2-button.svg";
import history from '../services/history';
import {Menu, Sidebar, Segment } from 'semantic-ui-react';

const videoConstraints = {
  width: 1400,
  height: 500,
  facingMode: "user"
};

var inputName = "own-q";

function EditRecorder () {
    const [visible, setVisible] = React.useState(false)

    var videotype; //the variable that holds the video type whether filler, reeting etc (wahib)

    var question = "Your Question"; // question of the video that the person is editing, will need to be retrieved from database (wahib)

    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);


    const handleStartCaptureClick = React.useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, setCapturing, mediaRecorderRef]);

    const handleDataAvailable = React.useCallback(
        ({ data }) => {
        if (data.size > 0) {
            setRecordedChunks((prev) => prev.concat(data));
        }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = React.useCallback(() => {
        mediaRecorderRef.current.stop();
        setCapturing(false);
    }, [mediaRecorderRef, webcamRef, setCapturing]);

    const handleDownload = React.useCallback(() => {
        if (inputName == "own-q"){
        alert("Cannot submit until a question is chosen or written, ensure that text field is not highlight when submitting");
        } else {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
            type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style = "display: none";
            a.href = url;
            a.download = inputName+".mp4";
            a.click();
            setRecordedChunks([]);
        }
        }
    }, [recordedChunks]);

    function myChangeHandler(event){
        inputName = event.target.value;
    }
    
    function chooseQuestion(event){
        event.preventDefault();
        question = inputName;
    }

    function close(){
        history.goBack();
    }

    function changehandler(event){
        event.preventDefault();
        var name = event.target.className;

        switch(name) {
            case 'edit-menu-item':
                videotype = 'filler';
                break;
            case 'edit-menu-item1':
                videotype = 'greeting';
                break;
            case 'edit-menu-item2':
                videotype = 'exit';
                break;
            case 'edit-menu-item3':
                videotype = 'answer';
                break;
            case 'edit-menu-item4':
                videotype = 'y/n';
                break;
        }
    }

    // function needed to send new question and videotype back to database (wahib)
    return (
        <form className="edit-record-page"  onSubmit={chooseQuestion}>
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
                        <div className="edit-menu-header">Video Type</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={changehandler} className="edit-menu-item">Filler</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={changehandler} className="edit-menu-item1">Greeting</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={changehandler} className="edit-menu-item2">Exit</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={changehandler} className="edit-menu-item3">Regular Answer</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={changehandler} className="edit-menu-item4">Answer Y/N</div>
                    </Menu.Item>
                </Sidebar>

                <Sidebar.Pusher dimmed={visible}>
                    <Webcam className="edit-layout" audio={true} ref={webcamRef} mirrored={true} videoConstraints={videoConstraints}/>
                    {capturing ? (
                        <button className="edit-icon" onClick={handleStopCaptureClick}><img src={stopIcon}/></button>
                    ) : (
                        <button className="edit-icon" onClick={handleStartCaptureClick}><img src={recordIcon}/></button>
                    )}
                    {recordedChunks.length > 0 && (
                        <button className="edit-check" onClick={handleDownload}><i class="fa fa-check"></i></button>
                    )}

                    <input
                        className="edit-type-q edit-font-class-1"
                        defaultValue={question}
                        type={"text"}
                        onChange={myChangeHandler}
                    />
                    <div onClick={close}><img className="edit-close_icon" src={closeButton} /></div>
                    <div onClick={() => setVisible(true)}><img className="edit-menu_icon" src={menuButton} /></div>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
            </>
        </form>
    );
}

export default EditRecorder;