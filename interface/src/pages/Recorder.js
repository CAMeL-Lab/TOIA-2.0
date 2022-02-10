import './App.css';
import './Recorder.css';
import 'semantic-ui-css/semantic.min.css';
import React, {useState, useEffect, useRef} from "react";
import Webcam from "react-webcam";
import axios from 'axios';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import history from '../services/history';
import {Button, Image, Modal, Popup, TextArea, Icon} from 'semantic-ui-react';
import {Multiselect} from 'multiselect-react-dropdown';
import {default as EditCreateMultiSelect} from "editable-creatable-multiselect";
import Switch from "react-switch";
import {RecordAVideoCard, OnBoardingQCard} from './AvatarGardenPage';
import CheckMarkIcon from '../icons/check-mark-success1.webp';
import env from './env.json';
import videoTypesJSON from '../configs/VideoTypes.json';

const videoConstraints = {
    width: 720,
    height: 405,
    facingMode: "user"
};

// Post recording, question suggestion modal
function ModalQSuggestion(props) {

    const suggestedQs = props.suggestedQuestions.slice(0, 5);
    const recordNewVideoDisabled = (!props.AllowAddingCustomVideo);
    const {ModalOnOpen, ModalOnClose, OnShowRecording, OnCardClickFunc, OnAddVideoCallback} = props;

    return (
        <Modal
            open={props.active}
            onClose={ModalOnClose}
            onOpen={ModalOnOpen}
            trigger={<Button>Question Suggestion Modal</Button>}
        >
            <Modal.Header>Successful! Your TOIA has been saved.</Modal.Header>
            <Modal.Content image scrolling>
                <Image size='medium' src={CheckMarkIcon} wrapped/>

                <Modal.Description>
                    <p>
                        {(suggestedQs.length !== 0 ? "Here are some suggestions..." : "No suggestions.")}
                    </p>
                    <div className={"questionSuggestionsWrapper"}>
                        <div className="cards-wrapper ui">
                            <div className="ui cards">
                                <RecordAVideoCard onClick={OnAddVideoCallback} isDisabled={recordNewVideoDisabled}/>
                                {suggestedQs.map((q, index) => {
                                    return (<OnBoardingQCard data={q} onClick={(e) => {
                                        OnCardClickFunc(e, q)
                                    }} key={index}/>)
                                })}
                            </div>
                        </div>
                    </div>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={OnShowRecording} primary>
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
    const [suggestedQsListCopy, setSuggestedQsListCopy] = useState([]);
    const [suggestedQsListOrig, setSuggestedQsListOrig] = useState([]);
    const [waitingServerResponse, setWaitingServerResponse] = useState(false);
    const [questionSuggestionModalActive, setQuestionSuggestionModalActive] = useState(false);
    const [viewingRecordedView, setViewingRecordedVideo] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingOnBoardingQs, setPendingOnBoardingQs] = useState([]);
    const [defaultStreamAlertActive, setDefaultStreamAlertActive] = useState(false);

    const [transcribedAudio, setTranscribedAudio] = useState("");


    const [editVideoID, setEditVideoID] = useState('');

    const backgroundActiveColor = "#B1F7B0";
    const backgroundDefaultColor = "#e5e5e5";

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const {open} = state

    useEffect(() => {
        if (history.location.state === undefined) {
            history.push({
                pathname: '/'
            });
        }
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);

        if (history.location.state.isEditing){
            InitializeEditingMode();
        } else {
            if (history.location.state.suggestedQuestion != null) {
                let q = {question: history.location.state.suggestedQuestion};
                if (history.location.state.id_question) {
                    q = {...q, id_question: history.location.state.id_question};
                }
                setQuestionsSelected([...questionsSelected, q]);
            }

            initializeType();
            loadUserStreams().then((streamsReceived) => {
                setAllStreams(streamsReceived);
                setListStreams([streamsReceived[0]]);
                setMainStreamVal([streamsReceived[0]]);
            });
            fetchOnBoardingQuestions();
            loadSuggestedQuestions();
        }
    }, []);

    const loadUserStreams = () => {
        return new Promise((resolve => {
            axios.post(`${env['server-url']}/getUserStreams`, {
                params: {
                    toiaID: history.location.state.toiaID
                }
            }).then((res) => {
                let streamsReceived = [];
                res.data.forEach((stream) => {
                    streamsReceived.push({name: stream.name, id: stream.id_stream});
                });
                resolve(streamsReceived);
            });
        }))
    }

    const loadSuggestedQuestions = React.useCallback(() => {
        return new Promise(((resolve) => {
            axios.post(`${env['server-url']}/getUserSuggestedQs`, {
                params: {
                    toiaID: history.location.state.toiaID
                }
            }).then((res) => {
                setSuggestedQsListCopy(res.data);
                setSuggestedQsListOrig(res.data);
                resolve();
            });
        }))
    }, [setSuggestedQsListOrig, setSuggestedQsListCopy]);

    function fetchOnBoardingQuestions() {
        const toiaID = history.location.state.toiaID;
        const options = {method: 'GET', url: `${env['server-url']}/questions/onboarding/${toiaID}/pending`};

        axios.request(options).then(function (response) {
            if (response.status === 200) {
                setPendingOnBoardingQs(response.data);
                if (response.data.length !== 0 && !history.location.state.question_obj) {
                    alert("Please record the required videos before creating new ones!");
                    navigateToMyTOIA();
                }
            } else {
                alert("Something went wrong!");
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

    const InitializeEditingMode = () => {
        const type = history.location.state.type;
        const video_id = history.location.state.video_id;

        setWaitingServerResponse(true);

        if (type && video_id) {
            // Load all streams
            loadUserStreams().then((userAllStreams) => {
                setAllStreams(userAllStreams);
            })

            // Load Video Data
            loadVideoData(video_id, type).then((video_data) => {
                const video_streams_obj = video_data.streams;
                const video_questions = video_data.questions;
                const video_streams = video_streams_obj.map((stream, index) => {
                    return {name: stream.name, id: stream.id_stream}
                })

                // Set Selected Streams
                setListStreams(video_streams);
                setMainStreamVal(video_streams);

                // Set Selected Questions
                setQuestionsSelected(video_questions);

                // Set Type
                for (const entry of Object.keys(videoTypesJSON)) {
                    if (videoTypesJSON[entry].type === type) {
                        setVideoType(type);
                        setVideoTypeFormal(videoTypesJSON[entry].displayText);
                    }
                }

                // Set playback URL
                getVideoPlayBack(video_id).then((res_data) => {
                    fetch(res_data.videoURL)
                        .then(res => res.blob()) // Change to blob
                        .then(blob => {
                            setRecordedVideo(blob);

                            setAnswerProvided(res_data.videoAnswer);
                            setPrivacyText(res_data.videoPrivacy);
                            setPrivacySetting(res_data.videoPrivacy !== "Public")

                            setWaitingServerResponse(false);
                            setIsEditing(true);
                            setViewingRecordedVideo(true);
                        });
                })
            })
        } else {
            alert("Video Type and ID not specified");
            navigateToMyTOIA();
        }
    }

    const loadVideoData = (video_id, type) => {
        return new Promise(((resolve, reject) => {
            const options = {
                method: 'GET',
                url: `${env['server-url']}/videos/${history.location.state.toiaID}/`,
                params: {video_id: video_id, type: type}
            };

            axios.request(options).then(function (response) {
                if (response.status === 200) {
                    resolve(response.data);
                } else {
                    console.error(response);
                }
            }).catch(function (error) {
                console.error(error);
            });
        }))
    }

    const getVideoPlayBack = (video_id) => {
        return new Promise((resolve => {
            const options = {
                method: 'POST',
                url: `${env['server-url']}/getVideoPlayback`,
                headers: {'Content-Type': 'application/json'},
                data: {params: {playbackVideoID: video_id}}
            };

            axios.request(options).then(function (response) {
                if (response.status === 200) {
                    resolve(response.data);
                } else {
                    console.error(response);
                }
            }).catch(function (error) {
                console.error(error);
            });
        }))
    }

    const handleStartCaptureClick = React.useCallback((e) => {
        // start call  here
        resetTranscript();
        setRecordedChunks([]);
        setTranscribedAudio("")
        //SpeechRecognition.startListening({continuous: true});

        // requesting the server to start listening
        axios.post(`${env['server-url']}/transcribeAudio`, {
            params: {
                toiaID: history.location.state.toiaID,
                fromRecorder: true
            }
        }).then((res)=>{
            setTranscribedAudio(res.data);
            return;
        })

        // sending request to server
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

        // end call here 
        //SpeechRecognition.stopListening();
        // requesting the server to stop listening
        axios.post(`${env['server-url']}/endTranscription`, {
            params: {
                toiaID: history.location.state.toiaID
            }
        }).then((res)=>{
            setTranscribedAudio(res.data);
            return;
        })
        mediaRecorderRef.current.stop();
        setCapturing(false);
        e.preventDefault();
    }, [mediaRecorderRef, webcamRef, setCapturing]);

    function handleDownload(e) {
        e.preventDefault();
        if (!isDefaultStreamSelected()){
            setDefaultStreamAlertActive(true);
            return;
        }

        setWaitingServerResponse(true);

        makeSaveVideoRequest().then((res_data) => {
            resetTranscript();
            setRecordedChunks([]);
            setVideoThumbnail('');
            dispatch({type: 'close'});

            setVideoType(null);
            setVideoTypeFormal(null);

            setQuestionsSelected([]);
            setSuggestedQsListCopy([]);
            setSuggestedQsListOrig([]);

            fetchOnBoardingQuestions();

            loadSuggestedQuestions().then(() => {
                setWaitingServerResponse(false);
                setQuestionSuggestionModalActive(true);
            })
        }, (err) => {
            setWaitingServerResponse(false);
            alert("Something went wrong!")
            console.log(err);
        })

        // let form = new FormData();
        // form.append('blob', recordedVideo);
        // form.append('thumb', videoThumbnail);
        // form.append('id', toiaID);
        // form.append('name', toiaName);
        // form.append('language', toiaLanguage);
        // form.append('questions', JSON.stringify(questionsSelected));
        // form.append('answer', answerProvided);
        // form.append('videoType', videoType);
        // form.append('private', isPrivate.toString());
        // form.append('streams', JSON.stringify(listStreams));
        //
        // axios.post(`${env['server-url']}/recorder`, form, {
        //     headers: {
        //         "Content-type": "multipart/form-data"
        //     },
        // }).then(res => {
        //     if (res.status === 200) {
        //
        //     } else {
        //         setWaitingServerResponse(false);
        //         alert("Something went wrong!")
        //         console.log(res.data);
        //     }
        // }).catch(err => {
        //     setWaitingServerResponse(false);
        //     alert("Something went wrong!");
        //     console.log(err);
        // })
    }

    const makeSaveVideoRequest = (is_editing = false, save_as_new = false, old_video_id = '', old_video_type='') => {
        return new Promise(((resolve, reject) => {
            let form = new FormData();
            form.append('blob', recordedVideo);
            form.append('thumb', videoThumbnail);
            form.append('id', toiaID);
            form.append('name', toiaName);
            form.append('language', toiaLanguage);
            form.append('questions', JSON.stringify(questionsSelected));
            form.append('answer', answerProvided);
            form.append('videoType', videoType);
            form.append('private', isPrivate.toString());
            form.append('streams', JSON.stringify(listStreams));
            if (is_editing){
                form.append('is_editing', true);
                form.append('save_as_new', save_as_new.toString());
                form.append('old_video_id', old_video_id);
                form.append('old_video_type', old_video_type);
            }

            axios.post(`${env['server-url']}/recorder`, form, {
                headers: {
                    "Content-type": "multipart/form-data"
                },
            }).then(res => {
                if (res.status === 200) {
                    resolve(res.data);
                } else {
                    reject(res);
                }
            }).catch(err => {
                reject(err);
            })
        }))
    }

    const isDefaultStreamSelected = () => {
        let found = false;
        listStreams.forEach((stream)=>{
            if (stream.name === 'All'){
                found = true;
            }
        });
        return found;
    }

    const handleSaveAsNew = () => {
        if (!isDefaultStreamSelected()){
            setDefaultStreamAlertActive(true);
        } else {
            setWaitingServerResponse(true);
            makeSaveVideoRequest(true, true, history.location.state.video_id, history.location.state.type).then(() => {
                resetTranscript();
                setRecordedChunks([]);
                setVideoThumbnail('');
                dispatch({type: 'close'});

                setVideoType(null);
                setVideoTypeFormal(null);

                setQuestionsSelected([]);
                setSuggestedQsListCopy([]);
                setSuggestedQsListOrig([]);

                fetchOnBoardingQuestions();

                loadSuggestedQuestions().then(() => {
                    setWaitingServerResponse(false);
                    setQuestionSuggestionModalActive(true);
                })
            }, (err) => {
                setWaitingServerResponse(false);
                alert("Something went wrong!")
                console.log(err);
            })
        }
    }

    const handleUpdateVideo = () => {
        if (!isDefaultStreamSelected()){
            setDefaultStreamAlertActive(true);
        } else {
            setWaitingServerResponse(true);
            makeSaveVideoRequest(true, false, history.location.state.video_id, history.location.state.type).then(() => {
                resetTranscript();
                setRecordedChunks([]);
                setVideoThumbnail('');
                dispatch({type: 'close'});

                setVideoType(null);
                setVideoTypeFormal(null);

                setQuestionsSelected([]);
                setSuggestedQsListCopy([]);
                setSuggestedQsListOrig([]);

                fetchOnBoardingQuestions();

                loadSuggestedQuestions().then(() => {
                    setWaitingServerResponse(false);
                    setQuestionSuggestionModalActive(true);
                })
            }, (err) => {
                setWaitingServerResponse(false);
                alert("Something went wrong!")
                console.log(err);
            })
        }
    }

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
                    <source src={window.URL.createObjectURL(blob)} type='video/mp4'/>
                </video>;
                setVideoComponent(videoElem);
                // document.getElementById("videoRecorded").src = window.URL.createObjectURL(blob);
                setAnswerProvided(transcribedAudio);
                dispatch({type: 'open'});
            } else {
                alert("Please record a video clip before submitting your response.");
            }
        }
        event.preventDefault();
    }

    const togglePreviewBox = () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            setRecordedVideo(blob);
            setAnswerProvided(transcribedAudio);
            setViewingRecordedVideo(true);
        }
    }

    function openSuggestion(e, card) {
        history.push({
            pathname: '/recorder?type=' + card.type,
            state: {
                toiaName,
                toiaLanguage,
                toiaID,
                suggestedQuestion: card.question,
                id_question: card.id,
                question_obj: card
            }
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
                toiaName: history.location.state.toiaName,
                toiaLanguage: history.location.state.toiaLanguage,
                toiaID: history.location.state.toiaID
            }
        });
    }


    function initializeType() {
        let queryParams = new URLSearchParams(window.location.search);
        let vidType = queryParams.get('type'); // video type
        if (vidType == null) return;
        for (const entry of Object.keys(videoTypesJSON)) {
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

    const inlineStyleSetting = {
        modal: {
            height: '85vh',
            width: '65vw',
        }
    };

    const reset = () => {
        history.push({
            pathname: '/recorder',
            state: {
                toiaName,
                toiaLanguage,
                toiaID,
            }
        });
    }

    //code for webcam for Thumbnail
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

                    {videoThumbnail === '' ? <Webcam
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
                    {videoThumbnail !== '' ?
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
        if (isPrivate) {
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
        if (videoTypesJSON[typeIndex].auto_question) {
            setAutoSelectionQuestion(true);
            setQuestionsSelected([...questionsSelected, {question: videoTypesJSON[typeIndex].displayText}]);
        } else {
            if (autoSelectionQuestion) {
                setQuestionsSelected([]);
            }
            setAutoSelectionQuestion(false);
        }
    }

    function VideoTypeButton(props) {
        const isDisabled = props.isDisabled || false;

        const onClickHandler = (e) => {
            if (!isDisabled) {
                props.onClick(props.index);
            } else {
                e.stopPropagation();
                e.preventDefault();
            }
        }


        return (
            <Popup content={props.toolTipExample}
                   header={props.toolTipText}
                   size='mini'
                   inverted={true}
                   trigger={
                       <div
                           className={"side-button tooltip b" + (props.index + 1) + " " + ((isDisabled) ? "cursor-disabled" : "")}
                           style={{backgroundColor: props.type === videoType ? backgroundActiveColor : backgroundDefaultColor}}
                           onClick={onClickHandler}
                           video-type={props.type}>

                           {props.buttonText}
                       </div>
                   }
            />

        );
    }

    const VideoTypeButtonsAll = () => {
        let disabled = pendingOnBoardingQs.length !== 0;

        let jsx = [];
        Object.keys(videoTypesJSON).forEach((entry, index) => {
            entry = videoTypesJSON[entry];
            let elem = (
                <VideoTypeButton
                    type={entry.type}
                    onClick={handleVideoTypeButtonClick}
                    buttonText={entry.displayText}
                    toolTipText={entry.toolTip}
                    toolTipExample={entry.toolTipExample}
                    index={index}
                    key={index}
                    isDisabled={disabled}/>
            );
            jsx.push(elem);
        });
        return jsx;
    }

    return (
        <div className="record-page">
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
                        }}>{videoThumbnail === '' ? "Click to create a thumbnail!" : "Click to edit your thumbnail!"}</button>
                    </div>
                    <div id="divider"/>
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
                    <div className={"question-label-modal"}>Questions being answered:</div>
                    <div className={"question-selection-box question-modal-input"}>
                        <EditCreateMultiSelect
                            suggestions={suggestedQsListCopy}
                            selectedItems={questionsSelected}
                            updateSuggestions={(response) => {
                            }}
                            updateSelectedItems={(response) => {
                            }}
                            maxDisplayedItems={5}
                            placeholder={"Type your own question"}
                            displayField={"question"}
                            disabled={true}/>
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
                        <i className="fa fa-check"/>

                    </Button>
                </Modal.Actions>
            </Modal>

            <ModalQSuggestion
                active={questionSuggestionModalActive}
                ModalOnOpen={() => {
                    setQuestionSuggestionModalActive(true)
                }}
                ModalOnClose={reset}
                suggestedQuestions={[...pendingOnBoardingQs, ...suggestedQsListOrig]}
                OnCardClickFunc={openSuggestion}
                OnShowRecording={navigateToMyTOIA}
                OnAddVideoCallback={reset}
                AllowAddingCustomVideo={pendingOnBoardingQs.length === 0}/>

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

                    <hr className="divider1"/>
                    <div className="font-class-1 public tooltip"
                         style={{backgroundColor: isPrivate ? backgroundDefaultColor : backgroundActiveColor}}>
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
                        <Popup
                            trigger={
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
                                    disablePreSelectedValues={false}
                                    placeholder="Add Stream"
                                />
                            }
                            content={'Default stream must be selected!'}
                            on='click'
                            open={defaultStreamAlertActive}
                            onClose={()=>setDefaultStreamAlertActive(false)}
                            onOpen={()=>{setDefaultStreamAlertActive(true)}}
                            position='top center'
                            className={'StreamNotSelectedAlert'}
                        />

                    </div>
                </div>
                <div className="Video-Layout">
                    {(!viewingRecordedView) ? (
                        <div className="video-layout-recorder-box">
                            <div className="video-layout-player-top">
                                <Popup
                                    disabled={recordedChunks.length > 0}
                                    content={"Record a video to proceed"}
                                    trigger={
                                        <div style={{display: "inline-block"}}
                                             className="right floated recorder-next-btn-wrapper">
                                            <Button icon labelPosition='right' className="right floated"
                                                    onClick={() => {
                                                        togglePreviewBox()
                                                    }} disabled={!(recordedChunks.length > 0)}>
                                                Next
                                                <Icon name='right arrow'/>
                                            </Button>
                                        </div>
                                    }
                                />

                                {
                                    recordedChunks.length > 0 && (
                                        <Button icon labelPosition='left' className="right floated"
                                                onClick={handleStartCaptureClick}>
                                            Record Again
                                            <Icon name='repeat'/>
                                        </Button>
                                    )
                                }
                            </div>


                            <Webcam className="layout" audio={true} ref={webcamRef} mirrored={true}
                                    videoConstraints={videoConstraints}/>
                            {capturing ? (
                                <button className="icon tooltip videoControlButtons" onClick={handleStopCaptureClick}
                                        data-tooltip="Stop Recording">
                                    <i className="fa fa-stop"/>
                                </button>
                            ) : (
                                <button className="icon tooltip videoControlButtons cursor-pointer"
                                        onClick={handleStartCaptureClick} data-tooltip="Start Recording">
                                    <i className="fa fa-video-camera"/>
                                </button>
                            )}
                            {recordedChunks.length > 0 && (
                                <button className="recorder-check-btn check tooltip cursor-pointer" onClick={openModal}
                                        data-tooltip="Save Video">
                                    <i className="fa fa-check"/>
                                </button>
                            )}
                            <p className="recorder-speech">{transcribedAudio}</p>
                        </div>
                    ) : (
                        <div className="video-layout-player-box">
                            <div className="video-layout-player-top">
                                {
                                    (isEditing) ? (
                                        <Button.Group>
                                            <Popup
                                                content={"This will create a new entry, keeping the old one unchanged!"}
                                                inverted
                                                trigger={<Button onClick={handleSaveAsNew} loading={waitingServerResponse} disabled={waitingServerResponse}>Save As New</Button>}
                                            />
                                            <Button.Or/>
                                            <Button onClick={handleUpdateVideo} loading={waitingServerResponse} disabled={waitingServerResponse} positive>Update</Button>
                                        </Button.Group>
                                    ) : (
                                        <Button className="right floated" positive loading={waitingServerResponse}
                                                disabled={waitingServerResponse} onClick={handleDownload}>Save
                                            Video</Button>
                                    )
                                }

                                <Button icon labelPosition='left' className="right floated"
                                        onClick={() => setViewingRecordedVideo(false)} disabled={waitingServerResponse}>
                                    Record Again
                                    <Icon name='repeat'/>
                                </Button>
                            </div>

                            <div className="layout video-layout-player-middle">
                                <video autoPlay controls>
                                    <source src={(recordedVideo)? window.URL.createObjectURL(recordedVideo) : ""} type='video/mp4'/>
                                </video>
                            </div>

                            <div className="video-layout-player-bottom">
                                <TextArea
                                    placeholder={"Type video transcript here!"}
                                    value={transcribedAudio}
                                    onChange={(e) => {
                                        setAnswerProvided(e.target.value)
                                    }}/>
                            </div>
                        </div>
                    )}

                    <h5 className="ui header question-selection-box-label">
                        <div className="content">
                            Question(s):
                        </div>
                    </h5>

                    <div className="font-class-1 question-selection-box question-recorder-page-input">
                        <EditCreateMultiSelect
                            suggestions={suggestedQsListCopy}
                            selectedItems={questionsSelected}
                            updateSuggestions={(response) => {
                                setSuggestedQsListCopy(response.list);
                            }}
                            updateSelectedItems={(response) => {
                                setQuestionsSelected(response.list)
                                if (response.removedItem) {
                                    setSuggestedQsListCopy([...suggestedQsListCopy, response.removedItem])
                                }
                            }}
                            placeholder={"Type your own question"}
                            maxDisplayedItems={5}
                            displayField={"question"}
                            disabled={pendingOnBoardingQs.length !== 0}/>
                    </div>
{/*// */}
{/*//                     {recordedChunks.length > 0 && (*/}
{/*//                         <button className="check tooltip" onClick={openModal}><i className="fa fa-check"></i>*/}
{/*//                             <span className="check_tooltip">*/}
{/*//           Save Video*/}
{/*//           </span>*/}
{/*//                         </button>*/}
{/*//                     )}*/}
{/*//                     <p className="recorder-speech">{transcribedAudio}</p>*/}
{/*//                     <input*/}
{/*//                         className="type-q font-class-1"*/}
{/*//                         placeholder={"Type your own question"}*/}
{/*//                         value={questionSelected}*/}
{/*//                         id="video-text-box"*/}
{/*//                         type={"text"}*/}
{/*//                         onChange={setQuestionValue}*/}
{/*//                     />*/}
{/*// >>>>>>> master*/}
                </div>

            </div>
        </div>
    );
}

export default Recorder;

// removed this from icon -> style={{fontSize: 34}}
