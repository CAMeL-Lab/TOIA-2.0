import './App.css';
import './Recorder.css';
import 'semantic-ui-css/semantic.min.css';
import React, {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import axios from 'axios';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import history from '../services/history';
import {Button, Icon, Image, Modal} from 'semantic-ui-react';
import {Multiselect} from 'multiselect-react-dropdown';
import {default as EditCreateMultiSelect} from "editable-creatable-multiselect";
import Switch from "react-switch";
import {renderSuggestedQsCard} from './AvatarGardenPage';
import CheckMarkIcon from '../icons/check-mark-success1.webp';
import env from './env.json';
import videoTypesJSON from '../configs/VideoTypes.json';

const videoConstraints = {
    width: 720,
    height: 405,
    facingMode: "user"
};
// Post recording, question suggestion modal
function ModalQSuggestion (props) {

    const suggestedQs = props.suggestedQuestions.slice(0, 5);

    return (
        <Modal
            open={props.active}
            onClose={() => props.setActive(false)}
            onOpen={() => props.setActive(true)}
            trigger={<Button>Question Suggestion Modal</Button>}
        >
            <Modal.Header>Successful! Your TOIA has been saved.</Modal.Header>
            <Modal.Content image scrolling>
                <Image size='medium' src={CheckMarkIcon} wrapped />

                <Modal.Description>
                    <p>
                        Here are some suggestions...
                    </p>
                    <div className={"questionSuggestionsWrapper"}>
                        <div className="row positive-relative add-video-box" onClick={() => {props.onAddVideoCallback()}}>
                            <img className="garden-add add-video-image" src="/static/media/add-button.11fe26c1.svg" alt={"image"} />
                            <h1 className="video-text garden-font-class-3 add-video-text">Add Video</h1>
                        </div>

                        {suggestedQs.map((card, index) => {
                            return renderSuggestedQsCard(card, index, props.onCardClickFunct)
                        })}
                    </div>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => {props.modalCloseCallbackFunc();}} primary>
                    Show My Recordings
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

function Recorder() {

    function exampleReducer(state, action) {
        switch (action.type) {
            case 'close':
                return {open: false};
            case 'open':
                return {open: true};
        }
    }

    const {transcript, resetTranscript} = useSpeechRecognition({command: '*'});

    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);

    // const [questionList,setQuestionList]=useState([]);
    const [recordedVideo, setRecordedVideo] = useState();
    const [videoType, setVideoType] = useState(null);
    const [videoTypeFormal, setVideoTypeFormal] = useState(null);
    const [questionsSelected, setQuestionsSelected] = useState([]);
    const [autoSelectionQuestion, setAutoSelectionQuestion] = useState(false);
    const [answerProvided, setAnswerProvided] = useState("");
    const [isPrivate, setPrivacySetting] = useState(false);
    const [privacyText, setPrivacyText] = useState("Public");
    const [allStreams, setAllStreams] = useState([]);
    const [listStreams, setListStreams] = useState([]);
    const [mainStreamVal, setMainStreamVal] = useState([]);
    const [videoPlayback, setVideoComponent] = useState(null);
    const [videoThumbnail, setVideoThumbnail] = useState('');
    const [suggestedQsListCopy,setSuggestedQsListCopy]=useState([]);
    const [suggestedQsListOrig, setSuggestedQsListOrig] = useState([]);
    const [waitingServerResponse, setWaitingServerResponse] = useState(false);
    const [questionSuggestionModalActive, setQuestionSuggestionModalActive] = useState(false);

    const backgroundActiveColor = "#B1F7B0";
    const backgroundDefaultColor = "#e5e5e5";

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const {open} = state

    useEffect(() => {
        initializeType();

        if (history.location.state == undefined) {
            history.push({
                pathname: '/'
            });
        }
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);

        if (history.location.state.videoID != null) {
            let videoTypeEdit = history.location.state.videoType;
            setVideoType(videoTypeEdit);
            setVideoTypeFormal(videoTypesJSON.videoTypeEdit);
            setQuestionsSelected([...questionsSelected, {question:history.location.state.videoType}]);
        }
        if (history.location.state.suggestedQuestion != null) {
            setQuestionsSelected([...questionsSelected, {question:history.location.state.suggestedQuestion}]);
        }

        axios.post(`${env['server-url']}/getUserStreams`, {
            params: {
                toiaID: history.location.state.toiaID
            }
        }).then((res) => {
            let streamsReceived = [];
            res.data.forEach((stream) => {
                streamsReceived.push({name: stream.name, id: stream.id_stream});
            });
            setAllStreams(streamsReceived);
            setListStreams([streamsReceived[0]]);
            setMainStreamVal([streamsReceived[0]]);
        });

        loadSuggestedQuestions();
    }, []);

    const loadSuggestedQuestions = () => {
        return new Promise(((resolve, reject) => {
            axios.post(`${env['server-url']}/getUserSuggestedQs`,{
                params: {
                    toiaID: history.location.state.toiaID
                }
            }).then((res) => {
                setSuggestedQsListCopy(res.data);
                setSuggestedQsListOrig(res.data);
                resolve();
            });
        }))
    }

    const handleStartCaptureClick = React.useCallback((e) => {
        resetTranscript();
        setRecordedChunks([]);
        SpeechRecognition.startListening({continuous: true});
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
        ({data}) => {
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

    function handleDownload(e) {
        e.preventDefault();
        let questionsList = questionsSelected.map(questionObj => {
            return questionObj.question
        });
        setWaitingServerResponse(true);

        let form = new FormData();
        form.append('blob', recordedVideo);
        form.append('thumb', videoThumbnail);
        form.append('id', toiaID);
        form.append('name', toiaName);
        form.append('language', toiaLanguage);
        form.append('questions', JSON.stringify(questionsList));
        form.append('answer', answerProvided);
        form.append('videoType', videoType);
        form.append('private', isPrivate.toString());
        form.append('streams', JSON.stringify(listStreams));

        axios.post(`${env['server-url']}/recorder`, form, {
            headers: {
                "Content-type": "multipart/form-data"
            },
        }).then(res => {
            resetTranscript();
            setRecordedChunks([]);
            setVideoThumbnail('');
            dispatch({type: 'close'});

            setVideoType(null);
            setVideoTypeFormal(null);

            setQuestionsSelected([]);

            setWaitingServerResponse(false);
            setQuestionSuggestionModalActive(true);
        }).catch(err => {
            console.log(err);
        })
    };

    function openModal(event) {
        if (questionsSelected.length === 0) {
            alert("Please choose a question before submitting your response.");
        } else if (videoType == null) {
            alert("Please choose a video type before submitting your response.");
        } else {
            if (recordedChunks.length) {
                const blob = new Blob(recordedChunks, {
                    type: "video/webm"
                });
                setRecordedVideo(blob);
                // the ratio we are using is 16:9 or the universal high definition standard for european television
                let videoElem = <video id="playbackVideo" width="496" height="324" autoPlay controls>
                    <source src={window.URL.createObjectURL(blob)} type='video/mp4'></source>
                </video>;
                setVideoComponent(videoElem);
                // document.getElementById("videoRecorded").src = window.URL.createObjectURL(blob);
                setAnswerProvided(transcript);
                dispatch({type: 'open'});
            } else {
                alert("Please record a video clip before submitting your response.");
            }
        }
        event.preventDefault();
    }

    function openSuggestion(e,card){
        axios.post(`${env['server-url']}/removeSuggestedQ`,{
            params:{
                suggestedQID: card.id_question
            }
        }).then((res)=>{
            history.push({
                pathname: '/recorder?type='+card.type,
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                    suggestedQuestion: card.question
                }
            });
        });
    }

    function exampleReducer2(state2, action) { // for account settings window
        switch (action.type) {
            case 'close':
                return {open2: false};
            case 'open':
                return {open2: true};
        }
    }

    const [state2, dispatch2] = React.useReducer(exampleReducer2, {open2: false,})
    const {open2} = state2

    function openModal2(e) {
        dispatch2({type: 'open'});
        e.preventDefault();
    }

    function handleClose(e) {
        e.preventDefault();
        setVideoComponent(null);
        setRecordedChunks([]);
        dispatch({type: 'close'});
    }

    function navigateToHome() {
        history.push({
            pathname: '/',
            state: {
                toiaName,
                toiaLanguage,
                toiaID
            }
        });
    }

    function navigateToAbout() {
        history.push({
            pathname: '/about',
            state: {
                toiaName,
                toiaLanguage,
                toiaID
            }
        });
    }

    function navigateToLibrary() {
        history.push({
            pathname: '/library',
            state: {
                toiaName,
                toiaLanguage,
                toiaID
            }
        });
    }

    function navigateToMyTOIA() {
        history.push({
            pathname: '/mytoia',
            state: {
                toiaName,
                toiaLanguage,
                toiaID
            }
        });
    }


    function initializeType() {
        let queryParams = new URLSearchParams(window.location.search);
        let vidType = queryParams.get('type'); // video type
        if (vidType == null)return;
        for (const entry of Object.keys(videoTypesJSON)){
            if (videoTypesJSON[entry].type === vidType) {
                setVideoType(vidType);
                setVideoTypeFormal(videoTypesJSON[entry].displayText);
            }
        }
    }

    function setAnswerValue(event) {
        setAnswerProvided(event.target.value);
    }

    function logout() {
        //logout function needs to be implemented (wahib)
        history.push({
            pathname: '/',
        });
    }

    const customStyles = {
        option: (styles, {isDisabled, isFocused, isSelected}) => {
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
        control: styles => ({...styles, backgroundColor: 'rgba(126, 124, 124, 0.1)'}),
        multiValue: (styles, {data}) => {
            return {
                ...styles,
                backgroundColor: '#e5e5e5',
            };
        },
    };

    const inlineStyleSetting = {
        modal: {
            height: '85vh',
            width: '65vw',
        }
    };

    const reset = () => {
        window.location.reload();
    }

    //code for webcam for Thumbnail
    const WebcamComponent = () => <Webcam/>;

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
                        borderRadius={5}
                    /> : <img src={videoThumbnail}/>}
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

    const handlePrivacySwitch = () => {
        if (isPrivate){
            setPrivacySetting(false);
            setPrivacyText("Public");
        } else {
            setPrivacySetting(true);
            setPrivacyText("Private");
        }
    }

    const handleVideoTypeButtonClick = (typeIndex) => {
        setVideoType(videoTypesJSON[typeIndex].type);
        setVideoTypeFormal(videoTypesJSON[typeIndex].displayText);
        if (videoTypesJSON[typeIndex].auto_question){
            setAutoSelectionQuestion(true);
            setQuestionsSelected([...questionsSelected, {question: videoTypesJSON[typeIndex].displayText}]);
        } else {
            if (autoSelectionQuestion){
                setQuestionsSelected([]);
            }
            setAutoSelectionQuestion(false);
        }
    }

    function VideoTypeButtons(props) {
        return (
            <div className={"side-button tooltip b" + (props.index + 1)}
                 style={{backgroundColor: props.type == videoType ? backgroundActiveColor : backgroundDefaultColor}}
                 onClick={() => {
                     props.onClick(props.index);
                 }}
                 video-type={props.type}
            >
                {props.buttonText}

                <span className="tooltiptext">
                    {props.toolTipText}
                    <br/>

                    <i className="tooltipExample">{props.toolTipExample}</i>
                </span>
            </div>
        );
    }

    const VideoTypeButtonsAll = () => {
        let jsx = [];
        Object.keys(videoTypesJSON).map((entry, index) => {
            entry = videoTypesJSON[entry];
            let elem = (
                <VideoTypeButtons type={entry.type} onClick={handleVideoTypeButtonClick} buttonText={entry.displayText}
                                  toolTipText={entry.toolTip} toolTipExample={entry.toolTipExample} index={index} key={index}/>);
            jsx.push(elem);
        });
        return jsx;
    }

    return (
        <div className="record-page" name="form1" action="form1">
            <Modal //this is the new pop up menu

                size='large'
                style={{position: "absolute", height: "80%", width: "896px", top: "1.5%", alignContent: "center"}}
                open={open}
                onClose={handleClose}
            >
                <Modal.Header className="modal-header">
                    <div>Do you want to save this video entry?</div>
                </Modal.Header>
                <Modal.Content>
                    <div id="typeOfVideo">Video Type: {videoTypeFormal}</div>
                    <div id="privacyOfVideo">Privacy Settings: {privacyText}</div>
                    <div id="video_thumbnail">
                        <button onClick={(event) => {
                            openModal2(event)
                        }}>{videoThumbnail == '' ? "Click to create a thumbnail!" : "Click to edit your thumbnail!"}</button>
                    </div>
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
                    <div className={"question-label-modal"}>Questions being answered: </div>
                    <div className={"question-selection-box question-modal-input"}>
                        <EditCreateMultiSelect
                            suggestions={suggestedQsListCopy}
                            selectedItems={questionsSelected}
                            updateSuggestions={(newList, added, removed) => {
                                setSuggestedQsListCopy(newList);
                            }}
                            updateSelectedItems={(newList, added, removed, isCreated) => {
                                setQuestionsSelected(newList)
                            }}
                            maxDisplayedItems={5}
                            placeholder={"Type your own question"}
                            displayField={"question"}/>
                    </div>
                    {/* <div contentEditable="true" className="modal-ans font-class-1" onChange={setAnswerValue}>{answerProvided}
          </div> */}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' inverted onClick={handleClose} style={{position: "relative", bottom: "4px"}}>
                        {/*<i className="fa fa-check"></i>*/}
                        <p>Discard</p>
                    </Button>
                    <Button color='green' inverted onClick={handleDownload}
                            style={{position: "relative", bottom: "4px"}} loading={waitingServerResponse}>
                        {/*<i className="fa fa-check"></i>*/}
                        <p>Save</p>
                    </Button>
                </Modal.Actions>
            </Modal>
            <Modal //This is the settings pop menu, that shows whenever you delete or move videos
                size='large'
                closeIcon={true}
                style={inlineStyleSetting.modal}
                open={open2}
                onClose={() => dispatch2({type: 'close'})}
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
                    <Button color='green' inverted onClick={() => dispatch2({type: 'close'})}>
                        <i className="fa fa-check"></i>

                    </Button>
                </Modal.Actions>
            </Modal>

            <ModalQSuggestion active={questionSuggestionModalActive} setActive={setQuestionSuggestionModalActive} suggestedQuestions={suggestedQsListOrig} onCardClickFunct={openSuggestion} modalCloseCallbackFunc={navigateToMyTOIA} onAddVideoCallback={reset}/>

            <div className="nav-heading-bar">
                <div onClick={navigateToHome} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div onClick={navigateToAbout} className="nav-about_icon app-monsterrat-black">
                    About Us
                </div>
                <div onClick={navigateToLibrary} className="nav-talk_icon app-monsterrat-black ">
                    Talk To TOIA
                </div>
                <div onClick={navigateToMyTOIA} className="nav-my_icon app-monsterrat-black ">
                    My TOIA
                </div>
                <div onClick={logout} className="nav-login_icon app-monsterrat-black ">
                    Logout
                </div>
            </div>

            <div>
                <div className="side-bar">
                    <h1 className="title font-class-3 ">Recorder</h1>

                    {VideoTypeButtonsAll()}

                    <hr className="divider1"></hr>
                    <div className="font-class-1 public tooltip" style={{backgroundColor: isPrivate ? backgroundDefaultColor:backgroundActiveColor}}>
                        <span>Public</span>
                        <Switch
                            onChange={handlePrivacySwitch}
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

                        <span className="public_tooltip">
          Set the privacy of the specific video
          </span>
                    </div>
                    <div className="select">
                        <Multiselect
                            options={allStreams} // Options to display in the dropdown
                            onSelect={(list, item) => {
                                setListStreams(list)
                            }} // Function will trigger on select event
                            onRemove={(list, item) => {
                                setListStreams(list)
                            }} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown options
                            selectedValues={mainStreamVal}
                            disablePreSelectedValues={true}
                            placeholder="Add Stream"
                        />
                    </div>
                </div>
                <div className="Video-Layout">
                        <Webcam className="layout" audio={true} ref={webcamRef} mirrored={true}
                                videoConstraints={videoConstraints}/>
                        {capturing ? (
                            <button className="icon tooltip" onClick={handleStopCaptureClick}><i className="fa fa-stop"></i>
                                <span className="camera_tooltip">
          Click to stop recording
          </span>
                            </button>
                        ) : (
                            <button className="icon tooltip" onClick={handleStartCaptureClick}>
                                <i className="fa fa-video-camera"></i>
                                <span className="camera_tooltip">
          Click to start/restart recording
          </span>
                            </button>
                        )}
                        {recordedChunks.length > 0 && (
                            <button className="check tooltip" onClick={openModal}><i className="fa fa-check"></i>
                                <span className="check_tooltip">
          Save Video
          </span>
                            </button>
                        )}
                        <p className="recorder-speech">{transcript}</p>

                    <div className="font-class-1 question-selection-box question-recorder-page-input">
                        <EditCreateMultiSelect
                            suggestions={suggestedQsListCopy}
                            selectedItems={questionsSelected}
                            updateSuggestions={(newList, added, removed) => {
                                    setSuggestedQsListCopy(newList);
                            }}
                            updateSelectedItems={(newList, added, removed, isCreated) => {
                                setQuestionsSelected(newList)
                            }}
                            placeholder={"Type your own question"}
                            maxDisplayedItems={5}
                            displayField={"question"}/>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Recorder;

// removed this from icon -> style={{fontSize: 34}}
