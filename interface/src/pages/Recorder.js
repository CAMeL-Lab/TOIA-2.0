import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import history from "../services/history";
import { Button, Image, Modal, Popup, TextArea, Icon } from "semantic-ui-react";
import { Multiselect } from "multiselect-react-dropdown";
import { default as EditCreateMultiSelect } from "editable-creatable-multiselect";
import Switch from "react-switch";
import {
    RecordAVideoCard,
    OnBoardingQCard,
    SuggestedQCard,
    SuggestedQCardNoAction,
} from "./AvatarGardenPage";
import CheckMarkIcon from "../icons/check-mark-success1.webp";
import RecordButton from "../icons/record1.png";
import RecordingGif from "../icons/recording51.gif";
import videoTypesJSON from "../configs/VideoTypes.json";
import io from "socket.io-client";
import speechToTextUtils from "../transcription_utils";
import Tracker from "../utils/tracker";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { NotificationManager } from "react-notifications";
import getBlobDuration from "get-blob-duration";

import NavBar from './NavBar.js';

import i18n from "i18next";
import { Trans, useTranslation } from "react-i18next";

import {languageFlagsCSS, languageCodeTable} from "../services/languageHelper";


const videoConstraints = {
    width: 720,
    height: 405,
    facingMode: "user",
};
// Post recording, question suggestion modal
function ModalQSuggestion(props) {
    const suggestedQs = props.suggestedQuestions.slice(0, 5);
    const recordNewVideoDisabled = !props.AllowAddingCustomVideo;
    const {
        ModalOnOpen,
        ModalOnClose,
        OnShowRecording,
        OnCardClickFunc,
        OnAddVideoCallback,
    } = props;

    const { t } = useTranslation();

    const hasOnBoardingQs = () => {
        const allQs = props.suggestedQuestions;
        return (
            allQs.filter(
                q => q.hasOwnProperty("onboarding") && q.onboarding === 1,
            ).length > 0
        );
    };
    return (
        <Modal
            open={props.active}
            onClose={ModalOnClose}
            onOpen={ModalOnOpen}
            trigger={<Button>Question Suggestion Modal</Button>}
        >
            <Modal.Header>Successful! Your TOIA has been saved.</Modal.Header>
            <Modal.Content image scrolling>
                <Image size='medium' src={CheckMarkIcon} wrapped />

                <Modal.Description>
                    <p>
                        {(suggestedQs.length !== 0 ? t("show_suggestions") : t("no_suggestions"))}
                    </p>
                    <div className={"questionSuggestionsWrapper"}>
                        <div className="cards-wrapper ui">
                            <div className="ui cards">
                                <RecordAVideoCard onClick={OnAddVideoCallback} isDisabled={recordNewVideoDisabled} />
                                {suggestedQs.map((q, index) => {
                                    if (q.hasOwnProperty("onboarding") && q.onboarding === 1) {
                                        return (<OnBoardingQCard data={q} onClick={(e) => {
                                            OnCardClickFunc(e, q)
                                        }} key={index} />)
                                    } else {
                                        return (
                                            <SuggestedQCardNoAction data={q}
                                                onClick={(e) => {
                                                    if (!hasOnBoardingQs()) OnCardClickFunc(e, q);
                                                }}
                                                isDisabled={hasOnBoardingQs()}
                                                key={index} />
                                        )
                                    }
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
    );
}

function Recorder() {

    const { t } = useTranslation();

    const { transcript, resetTranscript } = useSpeechRecognition({ command: '*' });

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

    const [videoDuration, setVideoDuration] = useState(null);
    const videoPlaybackRef = useRef(null);

    const [videosCount, setVideosCount] = useState(0);
    const [videosTotalDuration, setVideosTotalDuration] = useState(null);

    const [videoLengthSeconds, setVideoLengthSeconds] = useState(0);

    // This is for tracking purpose. These timestamps do not reflect the video start and end timestamps
    const [recordStartTimestamp, setRecordStartTimestamp] = useState(null);
    const [recordEndTimestamp, setRecordEndTimestamp] = useState(null);
    const [interactionLanguage, setInteractionLanguage] = useState(languageCodeTable?.[i18n.language] || "en-US");

    const [transcribedAudio, setTranscribedAudio] = useState('');
    const [results, setResults] = useState([]);

    //const [socket, setSocket] = useState(null);
    const client = useRef();

    const backgroundActiveColor = "#B1F7B0";
    const backgroundDefaultColor = "#e5e5e5";

    // config 
    //let audioContext = new AudioContext();
    const bufferSize = 2048;

    const [isRecording, setIsRecording] = useState(false);


    //const [context, setContext] = useState(null);

    const context = React.useRef(null);
    //const [processor, setProcessor] = useState(null);

    const processor = React.useRef(null);
    //const [input, setInput] = useState(null);
    const input = React.useRef("");


    useEffect(() => {
        if (history.location.state === undefined) {
            history.push({
                pathname: '/'
            });
        }
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);


        if (history.location.state.isEditing) {
            InitializeEditingMode();
        } else {
            if (history.location.state.suggestedQuestion != null) {
                let q = { question: history.location.state.suggestedQuestion };
                if (history.location.state.id_question) {
                    q = { ...q, id_question: history.location.state.id_question };
                }
                setQuestionsSelected([...questionsSelected, q]);
            }

            initializeType();
            loadUserStreams().then((streamsReceived) => {
                setAllStreams(streamsReceived);
                setListStreams([streamsReceived[0]]);
                setMainStreamVal([streamsReceived[0]]);
            });
            // fetchOnBoardingQuestions();
            loadSuggestedQuestions();
        }

        fetchVideosCount();
        fetchVideosTotalDuration();
        // Tracker
        setRecordStartTimestamp(+ new Date());
        new Tracker().startTracking(history.location.state);
    }, []);

    useEffect(() => {
        GetVideoLength();
    }, [recordedChunks])



    const loadUserStreams = () => {
        return new Promise((resolve => {
            axios.post(`/api/getUserStreams`, {
                params: {
                    toiaID: history.location.state.toiaID
                }
            }).then((res) => {
                let streamsReceived = [];
                res.data.forEach((stream) => {
                    streamsReceived.push({ name: stream.name, id: stream.id_stream });
                });
                resolve(streamsReceived);
            });
        }))
    }

    const loadSuggestedQuestions = React.useCallback(() => {
        return new Promise(((resolve) => {
            axios.post(`/api/getUserSuggestedQs`, {
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
        const options = { method: 'GET', url: `/api/questions/onboarding/${toiaID}/pending` };

        axios.request(options).then(function (response) {
            if (response.status === 200) {
                setPendingOnBoardingQs(response.data);
                if (response.data.length !== 0 && !history.location.state.question_obj) {
                    if (!history.location.state.isEditing) {
                        alert("Please record the required videos before creating new ones!");
                    } else {
                        alert("You cannot edit videos before recording the required ones!");
                    }

                    navigateToMyTOIA();
                }
            } else {
                alert("Something went wrong!");
            }
        }).catch(function (error) {
            console.error(error);
        });
    }


    function fetchVideosCount() {
        const toiaID = history.location.state.toiaID;
        const options = {
            method: 'POST',
            url: '/api/getUserVideosCount',
            headers: { 'Content-Type': 'application/json' },
            data: { user_id: toiaID }
        };

        axios.request(options).then(function (response) {
            setVideosCount(response.data.count);
        }).catch(function (error) {
            NotificationManager.error("An error occurred!");
            console.error(error);
        });
    }


    function fetchVideosTotalDuration() {
        const toiaID = history.location.state.toiaID;

        const options = {
            method: 'POST',
            url: '/api/getTotalVideoDuration',
            headers: { 'Content-Type': 'application/json' },
            data: { user_id: toiaID }
        };

        axios.request(options).then(function (response) {
            setVideosTotalDuration(response.data.total_duration);
        }).catch(function (error) {
            NotificationManager.error("Couldn't fetch videos duration!");
            console.error(error);
        });
    }

    const InitializeEditingMode = () => {
        const type = history.location.state.type;
        const video_id = history.location.state.video_id;

        setWaitingServerResponse(true);

        if (type && video_id) {
            // Fetch on-boarding questions
            // fetchOnBoardingQuestions();

            // Load all streams
            loadUserStreams().then((userAllStreams) => {
                setAllStreams(userAllStreams);
            })

            // Load Video Data
            loadVideoData(video_id, type).then((video_data) => {
                const video_streams_obj = video_data.streams;
                const video_questions = video_data.questions;
                const video_streams = video_streams_obj.map((stream, index) => {
                    return { name: stream.name, id: stream.id_stream }
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

    const getTimeDiffString = (diff_in_seconds) => {
        diff_in_seconds = Math.floor(diff_in_seconds);
        let hours = Math.floor(diff_in_seconds / 60 / 60);
        let remaining = diff_in_seconds - hours * 60 * 60;
        let minutes = Math.floor(remaining / 60);
        let seconds = remaining % 60;

        if (hours !== 0) {
            return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
        } else {
            return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
        }
    }

    const loadVideoData = (video_id, type) => {
        return new Promise(((resolve, reject) => {
            const options = {
                method: 'GET',
                url: `/api/videos/${history.location.state.toiaID}/`,
                params: { video_id: video_id, type: type }
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
                url: `/api/getVideoPlayback`,
                headers: { 'Content-Type': 'application/json' },
                data: { params: { playbackVideoID: video_id } }
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



    function handleDataReceived(data) {
        //setTranscribedAudio(oldData => [...oldData, data])
        //setTranscribedAudio(input.current + " " + data);

        console.log("HDR transcribedAudio:", input.current + " " + data.alternatives[0].transcript);
        setTranscribedAudio(input.current + " " + data.alternatives[0].transcript);

        let isFinal = undefined || data.isFinal

        if (data && isFinal) {
            setTranscribedAudio(input.current + " " + data.alternatives[0].transcript);

            input.current += (" " + data.alternatives[0].transcript);
            console.log("HDR2 transcribedAudio:", input.current);
            console.log("HDR2 results:", results, "to", [...results, data.alternatives[0].words]);
            setResults(results => [...results, data.alternatives[0].words]);
          }
          
      }


    const handleStartCaptureClick = React.useCallback((e) => {
        // start call  here
        console.log("HSCC", results, "to", []);
        resetTranscript();
        setRecordedChunks([]);
        setTranscribedAudio("")
        setResults([]);
        input.current = "";
        setIsRecording(true)

        // starting listening through socket
        //startRecording();
        const params = {
            language: interactionLanguage
        };
        console.log("Language Set:", interactionLanguage);
        speechToTextUtils.initRecording(params, handleDataReceived, (error) => {
            console.error('Error when transcribing', error);
            setIsRecording(false)
            // No further action needed, as stream already closes itself on error
        })

        // sending request to server
        setCapturing(true);

        try {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: "video/webm"
            });
        } catch (e) {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: "video/mp4"
            });
        }

        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start(1000);
        e.preventDefault();
    }, [webcamRef, setCapturing, mediaRecorderRef, interactionLanguage]);

    const handleDataAvailable = React.useCallback(
        ({ data }) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = React.useCallback((e) => {
        // stop recording
        setIsRecording(false)
        speechToTextUtils.stopRecording();


        mediaRecorderRef.current.stop();
        setCapturing(false);
        e.preventDefault();
    }, [mediaRecorderRef, webcamRef, setCapturing]);

    function handleDownload(e) {
        e.preventDefault();
        if (!videoType) {
            NotificationManager.error("Video Type Not Selected!");
            return;
        }

        if (!isDefaultStreamSelected()) {
            setDefaultStreamAlertActive(true);
            return;
        }

        setWaitingServerResponse(true);

        makeSaveVideoRequest().then((res_data) => {
            resetTranscript();
            setRecordedChunks([]);
            setVideoThumbnail('');

            setVideoType(null);
            setVideoTypeFormal(null);

            setQuestionsSelected([]);
            setSuggestedQsListCopy([]);
            setSuggestedQsListOrig([]);

            // fetchOnBoardingQuestions();

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

    const makeSaveVideoRequest = (is_editing = false, save_as_new = false, old_video_id = '', old_video_type = '') => {
        console.log("SSSS", results);
        return new Promise(((resolve, reject) => {
            let endTimestamp = + new Date();

            let form = new FormData();
            form.append('blob', recordedVideo);
            form.append('thumb', videoThumbnail);
            form.append('id', toiaID);
            form.append('name', toiaName);
            form.append('language', interactionLanguage);
            form.append('questions', JSON.stringify(questionsSelected));
            form.append('answer', answerProvided);
            form.append('results', JSON.stringify(results));
            form.append('videoType', videoType);
            form.append('private', isPrivate.toString());
            form.append('streams', JSON.stringify(listStreams));
            form.append('video_duration', videoDuration.toString());

            console.log("SSSS2", results);

            form.append('start_time', recordStartTimestamp);
            form.append('end_time', endTimestamp);
            setRecordEndTimestamp(endTimestamp);

            if (is_editing) {
                form.append('is_editing', true);
                form.append('save_as_new', save_as_new.toString());
                form.append('old_video_id', old_video_id);
                form.append('old_video_type', old_video_type);
            }

            axios.post(`/api/recorder`, form, {
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
        listStreams.forEach((stream) => {
            if (stream.name === 'All') {
                found = true;
            }
        });
        return found;
    }

    const handleSaveAsNew = () => {
        if (!isDefaultStreamSelected()) {
            setDefaultStreamAlertActive(true);
        } else {
            setWaitingServerResponse(true);
            makeSaveVideoRequest(true, true, history.location.state.video_id, history.location.state.type).then(() => {
                resetTranscript();
                setRecordedChunks([]);
                setVideoThumbnail('');


                setVideoType(null);
                setVideoTypeFormal(null);

                setQuestionsSelected([]);
                setSuggestedQsListCopy([]);
                setSuggestedQsListOrig([]);

                // fetchOnBoardingQuestions();

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
        console.log(results);
        return;
        if (!isDefaultStreamSelected()) {
            setDefaultStreamAlertActive(true);
        } else {
            setWaitingServerResponse(true);
            makeSaveVideoRequest(true, false, history.location.state.video_id, history.location.state.type).then(() => {
                resetTranscript();
                setRecordedChunks([]);
                setVideoThumbnail('');

                setVideoType(null);
                setVideoTypeFormal(null);

                setQuestionsSelected([]);
                setSuggestedQsListCopy([]);
                setSuggestedQsListOrig([]);

                // fetchOnBoardingQuestions();

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

    const GetVideoLength = async () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            setVideoLengthSeconds(await getBlobDuration(blob));
        }
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
        if (card.id) {
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
        } else {
            history.push({
                pathname: '/recorder?type=' + card.type,
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                    suggestedQuestion: card.question,
                    id_question: card.id_question,
                    question_obj: card
                }
            });
        }
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
    function logout() {
        //logout function needs to be implemented (wahib)
        history.push({
            pathname: '/',
        });
    }
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
            setQuestionsSelected([...questionsSelected, { question: videoTypesJSON[typeIndex].displayText }]);
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
                        style={{ backgroundColor: props.type === videoType ? backgroundActiveColor : backgroundDefaultColor }}
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
                    isDisabled={disabled} />
            );
            jsx.push(elem);
        });
        return jsx;
    }

    return (
        <div className="record-page">
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
                AllowAddingCustomVideo={pendingOnBoardingQs.length === 0} />

            <NavBar
                toiaName={toiaName}
                toiaID={toiaID}
                isLoggedIn={true}
                toiaLanguage={toiaLanguage}
                history={history}
                showLoginModal={false}
            />

            <div>
                <div className="side-bar">
                    <h1 className="title font-class-3 ">Recorder</h1>

                    {VideoTypeButtonsAll()}

                    <hr className="divider1" />
                    <div className="font-class-1 public tooltip"
                        style={{ backgroundColor: isPrivate ? backgroundDefaultColor : backgroundActiveColor }}>
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
                            {t("privacy_tooltip")}
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
                                    placeholder={t("add_stream")}
                                />
                            }
                            content={t("alert_select_default_stream")}
                            on='click'
                            open={defaultStreamAlertActive}
                            onClose={() => setDefaultStreamAlertActive(false)}
                            onOpen={() => { setDefaultStreamAlertActive(true) }}
                            position='top center'
                            className={'StreamNotSelectedAlert'}
                        />

                    </div>
                </div>
                <div className="Video-Layout">
                    <div className="stats-container stats-container-recorder">
                        <div className="stats-wrapper">
                            <div className="stats-number">
                                {videosCount}
                            </div>
                            <div className="stats-label">
                                Total Videos
                            </div>
                        </div>

                        <div className="stats-wrapper">
                            <div className="stats-number">
                                {(videosTotalDuration) ? (videosTotalDuration / 60).toFixed(1) : 0}Min
                            </div>
                            <div className="stats-label">
                                Total Videos Length
                            </div>
                        </div>
                    </div>


                    {(!viewingRecordedView) ? (
                        <div className="video-layout-recorder-box">
                            <div className="video-layout-player-top">
                                <Popup
                                    disabled={recordedChunks.length > 0 && !isRecording}
                                    content={t("alert_record_video")}
                                    trigger={
                                        <div style={{ display: "inline-block" }}
                                            className="right floated recorder-next-btn-wrapper">
                                            <Button icon labelPosition='right' className="right floated"
                                                onClick={() => {
                                                    togglePreviewBox()
                                                }} disabled={!(recordedChunks.length > 0) || isRecording}>
                                                Next
                                                <Icon name='right arrow' />
                                            </Button>
                                        </div>
                                    }
                                />

                                {
                                    (recordedChunks.length > 0 && !isRecording) && (
                                        <Button icon labelPosition='left' className="right floated"
                                            onClick={handleStartCaptureClick}>
                                            {t("record_again_button")}
                                            <Icon name='repeat' />
                                        </Button>
                                    )
                                }
                            </div>


                            <Webcam className="layout"
                                audio={true}
                                ref={webcamRef}
                                mirrored={true}
                                videoConstraints={videoConstraints} />

                            <div className="timer-wrapper">
                                <div className="timer-view">{getTimeDiffString(videoLengthSeconds)}</div>
                            </div>

                            {capturing ? (
                                <button className="icon tooltip videoControlButtons" onClick={handleStopCaptureClick}
                                    data-tooltip={t("stop_recording_tooltip")}>
                                    {/* <i className="fa fa-stop"/> */}
                                    {/* <i class="huge icons"> */}
                                    {/* <i aria-hidden="true" class="stop circle outline icon"></i> */}
                                    {/* <i aria-hidden="true" class="red stop icon"></i> */}
                                    {/* </i> */}

                                    {/* stop */}
                                    {/* <i aria-hidden="true" class="stop circle outline icon"></i> */}

                                    <img src={RecordingGif} width={38.5} height={38.5} alt="record button" />

                                    {/* <i className="fa-solid fa-circle-stop"></i> */}
                                    {/* <div ><i aria-hidden="true" className="primary stop circle outline"/></div> */}
                                </button>
                            ) : (
                                <button className="icon tooltip videoControlButtons cursor-pointer"
                                    onClick={handleStartCaptureClick} data-tooltip={t("start_recording_tooltip")}>
                                    {/* <i className="fa fa-video-camera"/> */}
                                    <img src={RecordButton} width={38.5} height={38.5} alt="record button" />
                                </button>
                            )}

                            {(recordedChunks.length > 0 && !isRecording) && (
                                <button className="recorder-check-btn check tooltip cursor-pointer"
                                    onClick={() => {
                                        togglePreviewBox()
                                    }}
                                    data-tooltip={t("save_video_tooltip")}>
                                    <i className="fa fa-check" />
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
                                            <Popup content={t("editing_alert")}
                                                inverted
                                                trigger={<Button onClick={handleSaveAsNew} loading={waitingServerResponse} disabled={waitingServerResponse || !(videoDuration)}>{t("save_as_new_button")}</Button>}
                                            />
                                            <Button.Or />
                                            <Button onClick={handleUpdateVideo} loading={waitingServerResponse} disabled={waitingServerResponse || !(videoDuration)} positive>{t("update_button")}</Button>
                                        </Button.Group>
                                    ) : (
                                        <Button className="right floated" positive loading={waitingServerResponse}
                                            disabled={waitingServerResponse || !videoDuration} onClick={handleDownload}>
                                            {t("save_video_button")}
                                        </Button>
                                    )
                                }

                                <Button icon labelPosition='left' className="right floated"
                                    onClick={() => setViewingRecordedVideo(false)} disabled={waitingServerResponse}>
                                    {t("record_again_button")}
                                    <Icon name='repeat' />
                                </Button>
                            </div>

                            <div className="layout video-layout-player-middle">
                                <video autoPlay controls
                                    onLoadedMetadata={() => {
                                        // This is a trick to make video duration load instantly
                                        videoPlaybackRef.current.currentTime = 9999999999;
                                    }}

                                    onDurationChange={() => {
                                        if (videoPlaybackRef.current.duration && videoPlaybackRef.current.duration !== Infinity) {
                                            setVideoDuration(videoPlaybackRef.current.duration);
                                            videoPlaybackRef.current.currentTime = 0;
                                        }
                                    }} ref={videoPlaybackRef}>
                                    <source src={(recordedVideo) ? window.URL.createObjectURL(recordedVideo) : ""} type='video/mp4' />
                                </video>
                            </div>

                            <div className="video-layout-player-bottom">
                                <TextArea
                                    //placeholder={"Type video transcript here!"}
                                    placeholder={answerProvided}
                                    value={transcribedAudio}
                                    onChange={(e) => {
                                        setTranscribedAudio(e.target.value);
                                        setAnswerProvided(e.target.value)
                                    }} />
                            </div>
                        </div>
                    )}
                    {!viewingRecordedView && !capturing ? (
                        <div class="lang-recorder-container">
                            <div class="lang-dropdown">
                                <div class="lang-dropbtn"><span className={languageFlagsCSS[interactionLanguage]}></span></div>
                                <div class="lang-dropdown-content">
                                    <a href="#" onClick={() => setInteractionLanguage("en-US")}><span class="fi fi-us"></span></a>
                                    <a href="#" onClick={() => setInteractionLanguage("ar-AE")}><span class="fi fi-ae"></span></a>
                                    {/* <a href="#"><span class="fi fi-es"></span>SP</a> */}
                                    <a href="#" onClick={() => setInteractionLanguage("es-ES")}><span class="fi fi-es"></span></a>
                                    <a href="#" onClick={() => setInteractionLanguage("fr-FR")}><span class="fi fi-fr"></span></a>
                                </div>
                            </div>
                        </div>
                    ) : ('')}

                    <h5 className={`ui header question-selection-box-label ${t("alignment")}`}>
                        <div className="content">
                            {t("questions")}
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
                            placeholder={t("type_custom_question_input")}
                            maxDisplayedItems={5}
                            displayField={"question"}
                            autoAddOnBlur={true}
                            disabled={pendingOnBoardingQs.length !== 0} />
                    </div>
                </div>

            </div>
            <NotificationContainer />
        </div>
    );
}

export default Recorder;
