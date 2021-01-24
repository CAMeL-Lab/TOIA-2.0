
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
import {Menu, Sidebar, Segment, Modal, Header, Button } from 'semantic-ui-react';

const videoConstraints = {
  width: 1400,
  height: 500,
  facingMode: "user"
};

var videotype, newquestion, answer; //videotype holds the type of video, newquestion the question if chnaged, and answer,the answer to corresponding video (wahib)
var question = "Your Question"; // question of the video that the person is editing, will need to be retrieved from database (wahib)
newquestion = question;

function EditRecorder () {

    function exampleReducer( state, action ) {
        switch (action.type) {
          case 'close':
            return { open: false };
          case 'open':
            return { open: true }; 
        }
    }

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const [visible, setVisible] = React.useState(false)
    const { open } = state



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
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
            type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style = "display: none";
            a.href = url;
            a.download = ((newquestion === question) ? question+".mp4" : newquestion+".mp4");
            a.click();
            setRecordedChunks([]);
        }
    }, [recordedChunks]);

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
            case 'edit-type-q edit-font-class-1':
                newquestion = event.target.value;
                break;
            case 'edit-modal-ans edit-font-class-1':
                answer = event.target.value;
                break;
        }
    }

    function submitHandler(event){
        event.preventDefault();
        // function needed to send new question and videotype back to database (wahib)
    }
    
    const inlineStyle = {
        modal : {
            marginTop: '10%',
            marginLeft: '20%',
            height: '400px',
            width: '800px',
        }
    };

    return (
        <form className="edit-record-page"  onSubmit={submitHandler}>
            <>
            <Modal //this is the new pop up menu
            closeIcon={true}
            size='large'
            style={inlineStyle.modal}
            open={open} 
            onClose={() => dispatch({ type: 'close' })}
            >
                <Modal.Header className="edit-modal-header">Write your answer</Modal.Header>
                <Modal.Content>
                <textarea
                    className="edit-modal-ans edit-font-class-1"
                    placeholder= "Type something...."//delete this whe finished
                    //defaultValue={} the variable containing the speech to text should show up here, so they can edit it
                    type={"text"}
                    onChange={changehandler}
                > 
                </textarea>
                </Modal.Content>
                <Modal.Actions>
                <Button color='green' inverted onClick={handleDownload}>
                    <i class="fa fa-check"></i>
                </Button>
                </Modal.Actions>
            </Modal>
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
                        <button className="edit-check" onClick={() => dispatch({ type: 'open' })}><i class="fa fa-check"></i></button>
                    )}
                    <input
                        className="edit-type-q edit-font-class-1"
                        defaultValue={question}
                        type={"text"}
                        onChange={changehandler}
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