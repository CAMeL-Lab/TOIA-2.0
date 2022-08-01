import axios from "axios";
import React, { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Modal } from "semantic-ui-react";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import SuggestiveSearch from "../suggestiveSearch/suggestiveSearch";
import speechToTextUtils from "../transcription_utils";
import PopModal from "../userRating/popModal";
import Tracker from "../utils/tracker";
import VideoPlaybackPlayer from "./sub-components/Videoplayback.Player";

function Player() {
    function exampleReducer(state, action) {
        switch (action.type) {
            case "close":
                return { open: false };
            case "open":
                return { open: true };
        }
    }

    const commands = [
        {
            command: "*",
            callback: fetchData,
        },
    ];

    const [toiaName, setName] = React.useState(null);
    const [toiaLanguage, setLanguage] = React.useState(null);
    const [interactionLanguage, setInteractionLanguage] = useState(null);
    const [toiaID, setTOIAid] = React.useState(null);
    const [isLoggedIn, setLoginState] = useState(false);

    const [toiaIDToTalk, setTOIAIdToTalk] = useState(null);
    const [toiaFirstNameToTalk, setTOIAFirstNameToTalk] = useState(null);
    const [toiaLastNameToTalk, setTOIALastNameToTalk] = useState(null);
    const [streamIdToTalk, setStreamIdToTalk] = useState(null);
    const [streamNameToTalk, setStreamNameToTalk] = useState(null);
    const [fillerPlaying, setFillerPlaying] = useState(true);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);

    const [videoProperties, setVideoProperties] = useState(null);
    const [isInteracting, setIsInteracting] = useState(false);

    const [hasRated, setHasRated] = useState(true); // controll the rating field
    const [ratingVal, setRatingVal] = useState(1);
    const [videoID, setVideoID] = useState(null);

    const [transcribedAudio, setTranscribedAudio] = useState("");

    const textInput = React.useRef("");
    const question = React.useRef("");
    const interacting = React.useRef("false");
    const newRating = React.useRef("true");
    const isFillerPlaying = React.useRef("true");

    var input1, input2;
    let [micMute, setMicStatus] = React.useState(true);
    let [micString, setMicString] = React.useState("INTERACT");

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

        setTOIAIdToTalk(history.location.state.toiaToTalk);
        setTOIAFirstNameToTalk(history.location.state.toiaFirstNameToTalk);
        setTOIALastNameToTalk(history.location.state.toiaLastNameToTalk);
        setStreamIdToTalk(history.location.state.streamToTalk);
        setStreamNameToTalk(history.location.state.streamNameToTalk);

        canAccessStream();

        fetchAnsweredQuestions();

        fetchFiller();

        // Tracker
        new Tracker().startTracking(history.location.state);
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
            .then(function (response) {})
            .catch(function (error) {
                alert("You do not have permission to access this page");
                library();
            });
    }

    // handling data recieved from server
    function handleDataReceived(data) {
        // setting the transcribedAudio
        if (data) {
            // transcribedAudio.current = data.alternatives[0].transcript;
            setTranscribedAudio(data.alternatives[0].transcript);
            setHasRated(false);
            // newRating.current = 'false';
            if (data.isFinal) {
                question.current = data.alternatives[0].transcript;

                newRating.current = "false";
                speechToTextUtils.stopRecording();
                fetchData();
            }
        } else {
            console.log("no data received from server");
        }
    }

    // function to fetch answered user questions from the DB
    function fetchAnsweredQuestions() {
        axios
            .get(`/api/questions/answered/${history.location.state.toiaToTalk}`)
            .then((res) => {
                let answeredQuestionsData = [];
                res.data.forEach((answer) => {
                    if (answer.suggested_type == "answer") {
                        answeredQuestionsData.push({
                            question: answer.question,
                        });
                    }
                });
                setAnsweredQuestions([...answeredQuestionsData]);
            });
    }

    function textInputChange(val) {
        if (val) {
            textInput.current = val.question;
        }
    }

    const recordUserRating = function (rate) {
        // record the rating for the user
        const vidID = videoID.split("/"); // splitting by delimeter

        const options = {
            method: "POST",
            url: "/api/save_player_feedback",
            headers: { "Content-Type": "application/json" },
            data: {
                ...(history.location.state.toiaID && {
                    user_id: history.location.state.toiaID,
                }),
                video_id: vidID[vidID.length - 1],
                question: textInput.current,
                rating: rate,
            },
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.error(error);
            });
    };

    async function continueChat() {
        if (newRating.current != "false") {
            // if the user has rated then they can continue
            if (interacting.current == "true") {
                await endTranscription();

                speechToTextUtils.initRecording(handleDataReceived, (error) => {
                    console.error("Error when transcribing", error);
                });
            }
        } else {
            NotificationManager.warning("Please provide a rating", "", 3000);
        }
    }

    async function chatFiller() {
        if (newRating.current != "false") {
            fetchFiller();

            continueChat();
        } else {
            fetchFiller();
        }
    }

    const skipFiller = function () {
        if (isFillerPlaying.current == "true") {
            if (interacting.current == "false") {
                fetchFiller();
            } else {
                chatFiller();
            }
        }
    };

    function fetchData() {
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
                    },
                })
                .then((res) => {
                    if (res.data === "error") {
                        setFillerPlaying(true);
                    } else {
                        setFillerPlaying(true);
                        newRating.current = "false";
                        isFillerPlaying.current = "false";
                        setVideoID(res.data); // setting the video ID
                        setVideoProperties({
                            key: res.data + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                            onEnded:
                                interacting.current == "false"
                                    ? fetchFiller
                                    : chatFiller,
                            source: res.data,
                            fetchFiller: fetchFiller,
                            muted: false,
                            filler: false,
                        });

                        setTranscribedAudio("");
                    }
                });
        }
    }

    function endTranscription() {
        speechToTextUtils.stopRecording();
    }

    function micStatusChange() {
        if (micMute == true) {
            setMicStatus(false);
            setMicString("PAUSE");
            setIsInteracting(true);
            interacting.current = "true";

            if (newRating.current != "false") {
                speechToTextUtils.initRecording(handleDataReceived, (error) => {
                    console.error("Error when transcribing", error);
                    // No further action needed, as stream already closes itself on error
                });
            } else {
                NotificationManager.warning(
                    "Please provide a rating",
                    "",
                    3000
                );
            }
        } else {
            speechToTextUtils.stopRecording();
            setMicStatus(true);
            setMicString("INTERACT");
            setIsInteracting(false);
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
                        toiaFirstNameToTalk:
                            history.location.state.toiaFirstNameToTalk,
                        record_log: "true",
                        ...(history.location.state.toiaID && {
                            interactor_id: history.location.state.toiaID,
                        }),
                    },
                })
                .then(async (res) => {
                    setVideoProperties({
                        key: res.data + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                        onEnded:
                            interacting.current == "false"
                                ? fetchFiller
                                : chatFiller,
                        source: res.data,
                        muted: true,
                        filler: true,
                    });

                    document.getElementById("vidmain").load();
                    const playPromise = document
                        .getElementById("vidmain")
                        .play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then((_) => {
                                // Automatic playback started!
                                // Show playing UI.
                                console.log("audio played auto");
                            })
                            .catch((error) => {
                                // Auto-play was prevented
                                // Show paused UI.
                                console.log("playback prevented");

                                fetchFiller();
                            });
                    }
                });
        }
    }

    function textChange(e) {
        textInput.current = e.target.value;
    }

    function submitResponse(e) {
        // if hasRated == true then you can sumbit

        question.current = textInput.current;

        if (question.current != "" && newRating.current != "false") {
            setHasRated(false);
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
                    },
                })
                .then((res) => {
                    if (res.data === "error") {
                        setFillerPlaying(true);
                    } else {
                        setFillerPlaying(true);
                        setHasRated(false);
                        newRating.current = "false";
                        isFillerPlaying.current = "false";

                        setVideoProperties({
                            key: res.data + new Date(), // add timestamp to force video transition animation when the key hasn't changed
                            onEnded: fetchFiller,
                            source: res.data,
                            muted: false,
                            filler: false,
                        });

                        setVideoID(res.data); // setting the video ID
                        setTranscribedAudio("");
                        question.current = "";
                    }
                });
        } else if (newRating.current != "true") {
            NotificationManager.warning("Please provide a rating", "", 3000);
        }
    }

    function submitHandler(e) {
        e.preventDefault();

        let params = {
            email: input1,
            pwd: input2,
        };

        axios.post(`/api/login`, params).then((res) => {
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
        <div className="player">
            <Modal //this is the new pop up menu
                size="large"
                style={inlineStyle.modal}
                open={open}
                onClose={() => dispatch({ type: "close" })}
            >
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
                            onClick={signup}
                        >
                            Don't have an Account? Sign Up
                        </div>
                    </form>
                </Modal.Content>
            </Modal>
            <div className="nav-heading-bar">
                {newRating.current != "true" && (
                    <PopModal
                        setRating={setRatingVal}
                        setRatingDone={setHasRated}
                        userRating={recordUserRating}
                        newRatingVal={newRating}
                        skipFillerVid={skipFiller}
                    />
                )}

                <div
                    onClick={home}
                    className="nav-toia_icon app-opensans-normal"
                >
                    TOIA
                </div>
                <div
                    onClick={about}
                    className="nav-about_icon app-monsterrat-black "
                >
                    About Us
                </div>
                <div
                    onClick={library}
                    className="nav-talk_icon app-monsterrat-black "
                >
                    Talk To TOIA
                </div>
                <div
                    onClick={garden}
                    className="nav-my_icon app-monsterrat-black "
                >
                    My TOIA
                </div>
                <div
                    onClick={isLoggedIn ? logout : openModal}
                    className="nav-login_icon app-monsterrat-black"
                >
                    {isLoggedIn ? "Logout" : "Login"}
                </div>
            </div>
            <div className="player-group">
                <h1 className="player-name player-font-class-3 ">
                    {toiaFirstNameToTalk} {toiaLastNameToTalk}
                </h1>
                <p className="player-lang player-font-class-2 ">
                    {streamNameToTalk}
                </p>
                {videoProperties && (
                    <TransitionGroup>
                        <CSSTransition
                            key={videoProperties.key}
                            timeout={500}
                            classNames="fade"
                        >
                            <VideoPlaybackPlayer
                                onEnded={videoProperties.onEnded}
                                key={videoProperties.key}
                                muted={
                                    videoProperties.muted
                                        ? videoProperties.muted
                                        : false
                                }
                                source={videoProperties.source}
                                filler={videoProperties.filler}
                            />
                        </CSSTransition>
                    </TransitionGroup>
                )}
                {micMute ? (
                    <button
                        color="green"
                        className="ui green microphone button mute-button"
                        onClick={micStatusChange}
                    >
                        <i aria-hidden="true" class="microphone icon"></i>
                        {micString}
                    </button>
                ) : (
                    <button
                        className="ui secondary button mute-button"
                        onClick={micStatusChange}
                    >
                        <i aria-hidden="true" class="microphone slash icon"></i>
                        {micString}
                    </button>
                )}

                <button
                    className="ui red button skip-end-button"
                    onClick={
                        interacting.current == "false"
                            ? fetchFiller
                            : chatFiller
                    }
                >
                    {" "}
                    Skip to End{" "}
                    <i aria-hidden="true" class="angle double right icon"></i>
                </button>

                <div>
                    {micMute ? (
                        <>
                            {micMute && (
                                <SuggestiveSearch
                                    handleTextChange={textChange}
                                    handleTextInputChange={textInputChange}
                                    questions={[...answeredQuestions]}
                                />
                            )}

                            <button
                                color="green"
                                className="ui primary button submit-button"
                                onClick={submitResponse}
                            >
                                <i aria-hidden="true" class="send icon"></i>SEND
                            </button>
                        </>
                    ) : (
                        <input
                            className="type-q font-class-1"
                            placeholder={"Transcript"}
                            value={transcribedAudio || ""}
                            id="video-text-box"
                            type={"text"}
                            //onChange={setQuestionValue}
                        />
                    )}
                </div>
            </div>
            <NotificationContainer />
        </div>
    );
}

export default Player;
