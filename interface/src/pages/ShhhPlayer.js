import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import VoiceOverOffRoundedIcon from "@mui/icons-material/VoiceOverOffRounded";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Modal } from "semantic-ui-react";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import SuggestionCard from "../suggestiveSearch/shhhsuggesitonCards.js";
import SuggestiveSearch from "../suggestiveSearch/shhhsuggestiveSearch.js";
import speechToTextUtils from "../transcription_utils";
import Tracker from "../utils/tracker";
import ShhhVideoPlaybackPlayer from "./sub-components/shhh-Videoplayback.Player";
import './ShhhPage.css';


function ShhhPlayer() {
    function exampleReducer(state, action) {
        switch (action.type) {
            case "close":
                return { open: false };
            case "open":
                return { open: true };
        }
    }

    const [toiaName, setName] = React.useState(null);
    const [toiaLanguage, setLanguage] = React.useState(null);
    const [toiaID, setTOIAid] = React.useState(null);
    const [isLoggedIn, setLoginState] = useState(false);

    const [toiaFirstNameToTalk, setTOIAFirstNameToTalk] = useState(null);
    const [toiaLastNameToTalk, setTOIALastNameToTalk] = useState(null);
    const [streamNameToTalk, setStreamNameToTalk] = useState(null);
    const [fillerPlaying, setFillerPlaying] = useState(true);

    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    let allSuggestedQuestions = [];

    const [videoProperties, setVideoProperties] = useState(null);
    const [transcribedAudio, setTranscribedAudio] = useState("");

    // suggested questions for cards

    const textInput = React.useRef("");
    const question = React.useRef("");
    const interacting = React.useRef("false");
    const isFillerPlaying = React.useRef("true");
    const allQuestions = React.useRef([]);
    const shouldRefreshQuestions = React.useRef(false); // flag to indicate that the SuggestionCard module needs to refresh questions

    const interimTextInput = React.useRef("");

    var input1, input2;
    let [micMute, setMicStatus] = React.useState(true);


    useEffect(() => {
        // Login check. Note: This is very insecure and naive approach. Replace once a proper authentication system has been adopted.
        if (
            history.location.state === undefined ||
            history.location.state.toiaName === undefined ||
            history.location.state.toiaLanguage === undefined ||
            history.location.state.toiaID === undefined
        ) {
            alert("You must be logged in to access this page");
            history.push({
                pathname: "/",
            });
        }
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);

        if (history.location.state.toiaID != undefined) {
            setLoginState(true);
            setTOIAid(history.location.state.toiaID);
            setName(history.location.state.toiaName);
            setLanguage(history.location.state.toiaLanguage);
        }

        setTOIAFirstNameToTalk(history.location.state.toiaFirstNameToTalk);
        setTOIALastNameToTalk(history.location.state.toiaLastNameToTalk);
        setStreamNameToTalk(history.location.state.streamNameToTalk);

        canAccessStream();

        fetchAnsweredQuestions();
        fetchAllStreamQuestions();

        fetchFiller();
        // Tracker
        new Tracker().startTracking(history.location.state);
    }, []);

    useEffect(() => {
        const listener = event => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                event.preventDefault();

                submitResponse(event, "SEARCH");
            }
        };
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);

    const [state, dispatch] = React.useReducer(exampleReducer, { open: false });
    const { open } = state;

    function openModal(e) {
        dispatch({ type: "open" });
        e.preventDefault();
    }

    function myChangeHandler(event) {
        event.preventDefault();
        var name = event.target.name;

        switch (name) {
            case "email":
                input1 = event.target.value;
                break;
            case "pass":
                input2 = event.target.value;
                break;
        }
    }

    function canAccessStream() {
        let toiaID = history.location.state.toiaID;
        let streamID = history.location.state.streamToTalk;

        const options = {
            method: "POST",
            url: "/api/permission/stream",
            headers: { "Content-Type": "application/json" },
            data: { user_id: toiaID, stream_id: streamID },
        };

        axios
            .request(options)
            .then(function (response) { })
            .catch(function (error) {
                alert("You do not have permission to access this page");
                library();
            });
    }
    // if user asks one of the suggested questions
    function askQuestionFromCard(question) {
        const mode = "CARD";

        const oldQuestion = question;
        axios
            .post(`/api/player`, {
                params: {
                    toiaIDToTalk: history.location.state.toiaToTalk,
                    toiaFirstNameToTalk:
                        history.location.state.toiaFirstNameToTalk,
                    question: {
                        current: oldQuestion.question,
                    },
                    streamIdToTalk: history.location.state.streamToTalk,
                    record_log: "true",
                    ...(history.location.state.toiaID && {
                        interactor_id: history.location.state.toiaID,
                    }),
                    mode: mode,
                },
            })
            .then(res => {
                if (res.data === "error") {
                    setFillerPlaying(true);
                    console.log("error");
                } else {
                    setFillerPlaying(true);

                    isFillerPlaying.current = "false";

                    setVideoProperties({
                        key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                        onEnded: () => {
                            fetchFiller();
                        },
                        source: res.data.url,
                        fetchFiller: fetchFiller,
                        muted: false,
                        filler: false,
                        duration_seconds: res.data.duration_seconds || null,
                        question: oldQuestion.question,
                        video_id: res.data.video_id,
                    });

                    fetchAnsweredQuestions(
                        oldQuestion.question,
                        res.data.answer || "",
                    );
                    setTranscribedAudio("");
                }
            });
    }
    // Function ends here

    // handling data recieved from server
    function handleDataReceived(data) {
        // setting the transcribedAudio
        if (data) {
            setTranscribedAudio(data.alternatives[0].transcript);
            if (data.isFinal) {
                question.current = data.alternatives[0].transcript;

                // speechToTextUtils.stopRecording();
                fetchData("VOICE");
            }
        } else {
            console.log("no data received from server");
        }
    }

    // Sets the value of 'allQuestions' array
    // to be the string list of all questions of the stream
    function fetchAllStreamQuestions() {
        axios
            .get(
                `/api/questions/answered_filtered/${history.location.state.toiaToTalk}/${history.location.state.streamToTalk}`,
            )
            .then(res => {
                allQuestions.current = res.data || [];
            });
    }
    // function to fetch answered smart questions from the database
    // question: the last question asked by the user
    // answer: the answer given by the avatar
    function fetchAnsweredQuestions(question = "", answer = "") {
        axios
            .post("/api/getSmartQuestions", {
                params: {
                    toiaIDToTalk: history.location.state.toiaToTalk,
                    toiaFirstNameToTalk:
                        history.location.state.toiaFirstNameToTalk,
                    avatar_id: history.location.state.toiaToTalk,
                    stream_id: history.location.state.streamToTalk,
                    latest_question: question,
                    latest_answer: answer,
                },
            })
            .then(res => {
                // res.data contains the smart questions generated
                // If res.data is not an array, then there is an error, so stop.
                if (res.data.constructor !== Array) {
                    return;
                }

                res.data.forEach(q => {
                    // If the question is not an empty string AND has not been previously asked AND is not in the current list of possible questions
                    // then add it to the list of possible suggestions
                    if (
                        q.question != "" &&
                        !allSuggestedQuestions.includes(q)
                    ) {
                        answeredQuestions.push(q);
                        allSuggestedQuestions.push(q);
                    }
                });

                shouldRefreshQuestions.current = true;
                setAnsweredQuestions([...answeredQuestions]);
            });
    }

    function textInputChange(val) {
        if (val && val.question) {
            textInput.current = val.question;
        } else if (typeof val === "string") {
            textInput.current = val;
        }
    }

    function fetchData(mode = "UNKNOWN") {
        const oldQuestion = question.current;
        if (question.current == null || question.current == "") {
            setFillerPlaying(true);
            fetchFiller();
        } else {
            axios
                .post(`/api/player`, {
                    params: {
                        toiaIDToTalk: history.location.state.toiaToTalk,

                        toiaFirstNameToTalk:
                            history.location.state.toiaFirstNameToTalk,
                        question,
                        streamIdToTalk: history.location.state.streamToTalk,
                        record_log: "true",
                        ...(history.location.state.toiaID && {
                            interactor_id: history.location.state.toiaID,
                        }),
                        mode: mode,
                    },
                })
                .then(res => {
                    if (res.data === "error") {
                        setFillerPlaying(true);
                    } else {
                        setFillerPlaying(true);

                        isFillerPlaying.current = "false";
                        fetchAnsweredQuestions(oldQuestion, res.data.answer);
                        setVideoProperties({
                            key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                            onEnded: () => {
                                fetchFiller();
                            },
                            source: res.data.url,
                            fetchFiller: fetchFiller,
                            muted: false,
                            filler: false,
                            duration_seconds: res.data.duration_seconds || null,
                            question: question.current,
                            video_id: res.data.video_id,
                        });

                        setTranscribedAudio("");
                    }
                })
                .catch(e => {
                    console.error(e);
                });
        }
    }

    function endTranscription() {
        speechToTextUtils.stopRecording();
    }

    function micStatusChange() {
        if (micMute == true) {
            setMicStatus(false);
            interacting.current = "true";

            speechToTextUtils.initRecording(handleDataReceived, error => {
                console.error("Error when transcribing", error);
                // No further action needed, as stream already closes itself on error
            });
        } else {
            speechToTextUtils.stopRecording();
            setMicStatus(true);
            interacting.current = "false";
        }
    }

    function fetchFiller() {
        isFillerPlaying.current = "true";
        if (fillerPlaying) {
            axios
                .post(`/api/fillerVideo`, {
                    params: {
                        toiaIDToTalk: history.location.state.toiaToTalk,
                        streamIdToTalk: history.location.state.streamToTalk,
                        toiaFirstNameToTalk:
                            history.location.state.toiaFirstNameToTalk,
                        record_log: "true",
                        ...(history.location.state.toiaID && {
                            interactor_id: history.location.state.toiaID,
                        }),
                    },
                })
                .then(async res => {
                    setVideoProperties({
                        key: res.data + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                        onEnded: fetchFiller,
                        source: res.data,
                        muted: true,
                        filler: true,
                        duration_seconds: null,
                    });

                    document.getElementById("vidmain").load();
                    const playPromise = document
                        .getElementById("vidmain")
                        .play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(_ => {
                                // Automatic playback started!
                                // Show playing UI.
                            })
                            .catch(error => {
                                // Auto-play was prevented
                                // Show paused UI.

                                fetchFiller();
                            });
                    }
                });
        }
    }

    function setRefreshQuestionsFalse() {
        shouldRefreshQuestions.current = false;
    }

    function textChange(e) {
        textInput.current = e.target.value;
        interimTextInput.current = textInput.current;
    }

    function submitResponse(e, mode = "UNKNOWN") {

        question.current = textInput.current
            ? textInput.current
            : interimTextInput.current;

        if (question.current != "") {
            const oldQuestion = question.current;
            axios
                .post(`/api/player`, {
                    params: {
                        toiaIDToTalk: history.location.state.toiaToTalk,
                        toiaFirstNameToTalk:
                            history.location.state.toiaFirstNameToTalk,
                        question,
                        streamIdToTalk: history.location.state.streamToTalk,
                        record_log: "true",
                        ...(history.location.state.toiaID && {
                            interactor_id: history.location.state.toiaID,
                        }),
                        mode: mode,
                    },
                })
                .then(res => {
                    setFillerPlaying(true);
                    if (res.data !== "error") {
                        isFillerPlaying.current = "false";

                        setVideoProperties({
                            key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                            onEnded: () => {
                                fetchFiller();
                            },
                            source: res.data.url,
                            muted: false,
                            filler: false,
                            duration_seconds: res.data.duration_seconds || null,
                            question: question.current,
                            video_id: res.data.video_id,
                        });

                        fetchAnsweredQuestions(oldQuestion, res.data.answer);
                        setTranscribedAudio("");
                        question.current = "";
                    }
                })
                .catch(e => {
                    console.error(e);
                });
        }
    }

    function submitHandler(e) {
        e.preventDefault();

        let params = {
            email: input1,
            pwd: input2,
        };

        axios.post(`/api/login`, params).then(res => {
            if (res.data == -1) {
                //alert('Email not found');
                NotificationManager.error("Incorrect e-mail address.");
            } else if (res.data == -2) {
                NotificationManager.error("Incorrect password.");
            } else {
                history.push({
                    pathname: "/mytoia",
                    state: {
                        toiaName: res.data.firstName,
                        toiaLanguage: res.data.language,
                        toiaID: res.data.toia_id,
                    },
                });
            }
        });
    }

    function home() {
        if (isLoggedIn) {
            endTranscription();
            history.push({
                pathname: "/",
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                },
            });
        } else {
            history.push({
                pathname: "/",
            });
        }
    }

    function about() {
        if (isLoggedIn) {
            endTranscription();
            history.push({
                pathname: "/about",
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                },
            });
        } else {
            history.push({
                pathname: "/about",
            });
        }
    }

    function library() {
        if (history.location.state.toiaID != undefined) {
            endTranscription();
            history.push({
                pathname: "/library",
                state: {
                    toiaName: history.location.state.toiaName,
                    toiaLanguage: history.location.state.toiaLanguage,
                    toiaID: history.location.state.toiaID,
                },
            });
        } else {
            history.push({
                pathname: "/library",
            });
        }
    }

    function garden(e) {
        if (isLoggedIn) {
            endTranscription();
            history.push({
                pathname: "/mytoia",
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                },
            });
        } else {
            openModal(e);
        }
    }

    function logout() {
        //logout function needs to be implemented (wahib)
        history.push({
            pathname: "/",
        });
        endTranscription();
    }

    function signup() {
        history.push({
            pathname: "/signup",
        });
        endTranscription();
    }

    const inlineStyle = {
        modal: {
            height: "560px",
            width: "600px",
        },
    };

    return (
        <div className="shhh-player">
            <Modal //this is the new pop up menu
                size="large"
                style={inlineStyle.modal}
                open={open}
                onClose={() => dispatch({ type: "close" })}>
                <Modal.Header className="login_header">
                    <h1 className="login_welcome login-opensans-normal">
                        Welcome Back
                    </h1>
                    <p className="login_blurb login-montserrat-black">
                        Enter the following information to login to your TOIA
                        account
                    </p>
                </Modal.Header>

                <Modal.Content>
                    <form className="login_popup" onSubmit={submitHandler}>
                        <input
                            className="login_email login-font-class-1"
                            placeholder={"Email"}
                            type={"email"}
                            required={true}
                            onChange={myChangeHandler}
                            name={"email"}
                        />
                        <input
                            className="login_pass login-font-class-1"
                            placeholder={"Password"}
                            type={"password"}
                            required={true}
                            onChange={myChangeHandler}
                            name={"pass"}
                        />
                        <input
                            className="login_button smart-layers-pointers "
                            type="image"
                            src={submitButton}
                            alt="Submit"
                        />
                        <div
                            className="login_text login-montserrat-black"
                            onClick={signup}>
                            Don't have an Account? Sign Up
                        </div>
                    </form>
                </Modal.Content>
            </Modal>
            <div className="shhh-nav-heading-bar">

                <div
                    onClick={home}
                    className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
            </div>
            <div className="shhh-player-group">
                {videoProperties && (
                    <TransitionGroup>
                        <CSSTransition
                            key={videoProperties.key}
                            timeout={500}
                            classNames="fade">
                            <ShhhVideoPlaybackPlayer
                                onEnded={videoProperties.onEnded}
                                key={videoProperties.key}
                                muted={
                                    videoProperties.muted
                                        ? videoProperties.muted
                                        : false
                                }
                                source={videoProperties.source}
                                filler={videoProperties.filler}
                                duration_seconds={
                                    videoProperties.duration_seconds
                                }
                            />
                        </CSSTransition>
                    </TransitionGroup>
                )}
                {micMute ? (
                    <button
                        className="ui microphone button mute-button"
                        style={{ background: "#614CB8", width: "10%" }}
                        onClick={micStatusChange}>
                        <i aria-hidden="true" class="">
                            <RecordVoiceOverRoundedIcon
                                sx={{
                                    paddingTop: "0px",
                                    paddingRight: "0px",
                                    fontSize: "1.7rem",
                                }}
                            />
                        </i>
                    </button>
                ) : (
                    <button
                        className="ui secondary button mute-button"
                        onClick={micStatusChange}>
                        <i aria-hidden="true" class="">
                            <VoiceOverOffRoundedIcon />
                        </i>
                    </button>
                )}

                {isFillerPlaying.current == "false" ? (
                    <button
                        className="ui inverted button skip-end-button"
                        onClick={fetchFiller}>
                        {" "}
                        Skip to End{" "}
                        <i
                            aria-hidden="true"
                            class="angle double right icon"></i>
                    </button>
                ) : null}

                <div>
                    {micMute ? (
                        <>
                            {micMute && (
                                <SuggestiveSearch
                                    handleTextChange={textChange}
                                    handleTextInputChange={textInputChange}
                                    // questions={latestSuggestedQuestions}
                                    questions={allQuestions.current}
                                />
                            )}

                            <SuggestionCard
                                questions={answeredQuestions}
                                askQuestion={askQuestionFromCard}
                                shouldRefreshQuestions={shouldRefreshQuestions}
                                setRefreshQuestionsFalse={
                                    setRefreshQuestionsFalse
                                }
                                notificationManager={NotificationManager}
                            />
                            <button
                                className="ui linkedin button submit-button"
                                onClick={e => {
                                    submitResponse(e, "SEARCH");
                                }}>
                                <i aria-hidden="true" class="send icon"></i>
                            </button>

                        </>
                    ) : (
                        <input
                            className="transcript font-class-1"
                            placeholder={"Transcript"}
                            value={transcribedAudio || ""}
                            id="video-text-box"
                            type={"text"}
                        />
                    )}
                </div>
            </div>
            <NotificationContainer />
        </div>
    );
}



export default ShhhPlayer;