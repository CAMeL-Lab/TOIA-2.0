//Elephant in the Room Interaction Page 
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
import SuggestiveSearch from "../suggestiveSearch/shhhsuggestiveSearch.js";
import speechToTextUtils from "../transcription_utils";
import Tracker from "../utils/tracker";
import ShhhVideoPlaybackPlayer from "./sub-components/shhh-Videoplayback.Player";
import './ShhhPage.css';
//Characters in each stream
//Death
import james from "../images/death/james.png";
import rina from "../images/death/rina.png";
import sally from "../images/death/sally.png";
import brian from "../images/death/brian.png";
import jj from "../images/death/jj.png";
import ian from "../images/death/ian.png";
import layla from "../images/death/leila.png";
import norman from "../images/death/norman.png";
//Sex
import lucy from "../images/sex/lucy.png";
import lauren from "../images/sex/lauren.png";
import klarissa from "../images/sex/klarissa.png";
import ellis from "../images/sex/ellis.png";
import kenny from "../images/sex/kenny.png";
import kendel from "../images/sex/kendel.png";
import chris from "../images/sex/chris.png";
import zaldy from "../images/sex/zaldy.png";
//Birth
import krista from "../images/birth/krista.png";
import ashley from "../images/birth/ashley.png";
import alison from "../images/birth/alison.png";
import kieona from "../images/birth/kieona.png";
import kaylee from "../images/birth/kaylee.png";
import christian from "../images/birth/christian.png";
import stephanie from "../images/birth/stephanie.png";

const death_icons = [brian, jj, layla, james, rina, sally, ian, norman];
const sex_icons = [lucy, lauren, klarissa, ellis, kenny, kendel, chris, zaldy];
const birth_icons = [krista, ashley, alison, kieona, kaylee, christian, stephanie];
const death_names = ['Brian', 'JJ', 'Layla', 'James', 'Rina', 'Sally', 'Ian', 'Norman'];
const sex_names = ['Lucy', 'Lauren', 'Klarissa', 'Ellis', 'Kenny', 'Kendel', 'Chris', 'Zaldy'];
const birth_names = ['Krista', 'Ashley', 'Alison', 'Kieona', 'Kaylee', 'Christian', 'Stephanie'];
const death_descriptions = ['[Brian] A man with Parkinsons and its symptoms that can lead to earlier death', '[JJ] A 34-year-old man has been diagnosed with incurable colon cancer', '[Layla] A woman with end-stage renal disease', '[James] A Singaporean Man talks about life and superstition', '[Rina] A humorous Singaporean woman who has no regrets in life', '[Sally] A Singaporean woman who speaks about death in Mandarin', '[Ian] Singaporean Man', '[Norman] A Singaporean man who learned how to accept death'];
const sex_descriptions = ['[Lucy] A young woman who grew up in a culture of taboo around sex', '[Lauren] A sexual confidence coach who encourages open and non-judgmental conversations about sex', '[Klarissa] A bubbly young woman who talks about her first sexual experience and the things she wished she knew beforehand', '[Ellis] A gay man discusses his frustration with categorizing people and setting expectations in sexual encounters', '[Kenny] A gay man shares his insights on gay pornography and the importance of setting boundaries', '[Kendel] A gay man who gives a candid advice for first-time sex', '[Chris] A straight man who shares his past sexual insecurities and anxieties', '[Zaldy] A straight man who shares his definition of consent and shares his sexual insecurities, pressures, and more'];
const birth_descriptions = ['[Krista] A mother with one child delivered vaginally in a hospital setting and had an epidural.', '[Ashley]A mother of two children, both born vaginally.',
    '[Alison] A mother of two daughters delivered via two scheduled c-sections', '[Kieona] A mother of one daughter had a regular vaginal birth.', '[Kaylee] A mother who shares her candid pregnancy experiences', '[Christian] A mother who gave a birth through c-section and shares her high-blood pressure issues during pregnancy', '[Stephanie] A mother who underwent an emergency C-section and shares her body-transformation stories during pregnancy.'];
//Questions listed to help users ideate type of questions they can ask 
const death_questions = [
    "Are you afraid of death?",
    "Who is not invited to your funeral?",
    "How does dying feel like?",
    "Who would be happy that you are gone?",
    "What would you miss the most?",
    "Have you tried giving up?"
];
const sex_questions = [
    "What does penetration feel like?",
    "Do you get emotionally attached?",
    "Top or bottom?",
    "What should I know about gay sex?",
    "Any advice for someone's first time?",
    "How often do you think about sex?",
    "Is period sex okay?"
];

const birth_questions = [
    "What was labor like?",
    "Did you use epidural (spinal anesthesia)?",
    "Did you see your baby come out?",
    "How painful was labor?",
    "What's your most embarrassing story?",
    "Does your body change after giving birth?",
    "What’s the hardest part of pregnancy?",
    "Did you plan pregnancy?"
];

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


    const [icons, setIcons] = useState([]);
    const [iconNames, setIconNames] = useState([]);
    const [iconDescriptions, setIconDescriptions] = useState([]);

    const textInput = React.useRef("");
    const question = React.useRef("");
    const isFillerPlaying = React.useRef("true");
    const allQuestions = React.useRef([]);
    const shouldRefreshQuestions = React.useRef(false); // flag to indicate that the SuggestionCard module needs to refresh questions

    const interimTextInput = React.useRef("");

    var input1, input2;
    const [micMute, setMicMute] = useState(true);
    const [micString, setMicString] = useState("ASK BY VOICE");
    const interacting = React.useRef(false); // Ref for indicating whether the user is currently interacting or not
    const [textInputValue, setTextInputValue] = React.useState(""); // Stores the value of the text input
    const [dataIsFinal, setDataIsFinal] = React.useState(null) // Differentiates space key up with and without data

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
        // set the icon and icon name arrays based on streamNameToTalk
        if ({ streamNameToTalk }.streamNameToTalk === "Death stream") {
            setIcons(death_icons);
            setIconNames(death_names);
            setIconDescriptions(death_descriptions);
        } else if ({ streamNameToTalk }.streamNameToTalk === "Sex stream") {
            setIcons(sex_icons);
            setIconNames(sex_names);
            setIconDescriptions(sex_descriptions);
        } else if ({ streamNameToTalk }.streamNameToTalk === "Birth stream") {
            setIcons(birth_icons);
            setIconNames(birth_names)
            setIconDescriptions(birth_descriptions);
        }
    }, [streamNameToTalk]);

    //ask question on enter 
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

    //press space bar to unmute
    const [isSpaceKeyPressed, setIsSpaceKeyPressed] = React.useState(false);
    const isSpaceKey = React.useRef("false")
    const firstRender = React.useRef(false)

    //identify whether the spacebar is up or down (recording or not)
    useEffect(() => {
        // listener for spacebar down (not for while typing)
        const listenDown = event => {
            if (textInput.current == "" && event.code === "Space" && isSpaceKey.current === "false") {
                setIsSpaceKeyPressed(true)
                isSpaceKey.current = "true"
                setMicMute(false)
                console.log("key down");
            }
        };
        // listener for spacebar up
        const listenUp = event => {
            if (textInput.current == "" && event.code === "Space" && isSpaceKey.current === "true") {
                setIsSpaceKeyPressed(false)
                isSpaceKey.current = "false"
                setMicMute(true)
                console.log("key up");
            }
        };
        document.addEventListener("keydown", listenDown);
        document.addEventListener("keyup", listenUp);
        return () => {
            document.removeEventListener("keydown", listenDown);
            document.removeEventListener("keyup", listenUp);
        };
    }, []);

    //identify whether it is now being recorded, or not 
    useEffect((e) => {

        if (firstRender.current) {
            if (!micMute) {
                speechToTextUtils.stopRecording();
                if (dataIsFinal === false) {
                    textInput.current = transcribedAudio
                    submitResponse(e, "SEARCH")
                }

            } else {
                interacting.current = true;
                speechToTextUtils.initRecording(handleDataReceived, (error) => {
                    console.error("Error when transcribing", error);
                    // No further action needed, as stream already closes itself on error
                });
            }
        } else {
            firstRender.current = true
        }


    }, [isSpaceKeyPressed])



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

    // handling data recieved from server
    function handleDataReceived(data) {
        // setting the transcribedAudio
        if (data) {
            setTranscribedAudio(data.alternatives[0].transcript);
            setDataIsFinal(false)
            if (data.isFinal) {
                question.current = data.alternatives[0].transcript;
                setDataIsFinal(true)
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

    //changeing the status of the mic button  
    const micStatusChange = (e) => {
        if (!micMute) {
            speechToTextUtils.stopRecording();
            if (dataIsFinal === false) {
                textInput.current = transcribedAudio
                submitResponse(e, "SEARCH")
            }

        } else {
            interacting.current = true;
            speechToTextUtils.initRecording(handleDataReceived, (error) => {
                console.error("Error when transcribing", error);
                // No further action needed, as stream already closes itself on error
            });
        }

        setMicMute(!micMute);
        setMicString(micMute ? "STOP ASK BY VOICE" : "ASK BY VOICE");
        interacting.current = micMute ? true : false;
    };

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
        textInput.current = `${textInput.current} ${e.target.value}`;
        interimTextInput.current = textInput.current;
        setTextInputValue(e.target.value);
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
            textInput.current = "";
            interimTextInput.current = "";
            setTextInputValue("");
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

    function shhh() {
        if (isLoggedIn) {
            history.push({
                pathname: "/shhh",
                state: {
                    toiaName,
                    toiaLanguage,
                    toiaID,
                },
            });
        } else {
            history.push({
                pathname: "/shhh",
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

    const [selectedIconIndex, setSelectedIconIndex] = useState(null);


    const handleIconClick = (index) => {
        const iconName = iconNames[index];
        if (index === selectedIconIndex) {
            setSelectedIconIndex(null);
            // unmute all icons
            const iconContainers = document.querySelectorAll('.icon-container');
            iconContainers.forEach((container) => {
                container.classList.remove('muted');
            });
            textInput.current = ""; // reset to empty string
        } else {
            setSelectedIconIndex(index);
            // mute all icons except selected one
            const iconContainers = document.querySelectorAll('.icon-container');
            iconContainers.forEach((container, i) => {
                if (i === index) {
                    container.classList.remove('muted');
                } else {
                    container.classList.add('muted');
                }
            });
            textInput.current = iconName;
            interimTextInput.current = textInput.current;
        }
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
            <div className="back-to-shhh">
                <div onClick={shhh}>
                    <i className="fa fa-arrow-left"></i>
                </div>
            </div>
            <div className="icons">
                {icons.map((icon, index) => (
                    <div key={index} className="icon-container">
                        <img
                            src={icon}
                            className={index === selectedIconIndex ? 'selected' : ''}
                            onClick={() => handleIconClick(index)}
                        />
                        <div className="icon-name">{iconNames[index]}</div>
                        <div className="icon-description">{iconDescriptions[index]}</div>
                    </div>
                ))}
            </div>
            <div className="shhh-player-group">
                {videoProperties && (
                    <TransitionGroup>
                        <CSSTransition
                            key={videoProperties.key}
                            timeout={500}
                        >
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
                    <button className="ui secondary button shhh-mute-button" onClick={e => micStatusChange(e)}>
                        <i aria-hidden="true">
                            <VoiceOverOffRoundedIcon />
                        </i>
                    </button>
                ) : (
                    <button className="ui microphone button shhh-mute-button" onClick={micStatusChange}>
                        <i aria-hidden="true">
                            <RecordVoiceOverRoundedIcon
                            />
                        </i>
                    </button>
                )
                }


                {isFillerPlaying.current == "false" ? (
                    <button
                        className="ui inverted button shhh-skip-end-button"
                        onClick={fetchFiller}>
                        {" "}
                        Skip to End{" "}
                        <i
                            aria-hidden="true"
                            class="angle double right icon"></i>
                    </button>
                ) : null}


                <div className="ask_box">
                    <input
                        className="shhh-transcript font-class-1"
                        placeholder={"Voice transcribed here. Press space bar or click unmute to start."}
                        value={transcribedAudio || ""}
                        id="video-text-box"
                        type={"text"}
                        readOnly
                        tabIndex={-1}
                        autoFocus={false}
                        style={{ outline: 'none', caretColor: 'transparent' }}

                    />
                    <div className="AskMe">
                        {streamNameToTalk && streamNameToTalk.includes(" stream") && (
                            <h2>Hey, let's talk about {streamNameToTalk.replace(" stream", "")}</h2>
                        )}
                        <ul>
                            {streamNameToTalk === "Death stream" && death_questions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                            {streamNameToTalk === "Sex stream" && sex_questions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                            {streamNameToTalk === "Birth stream" && birth_questions.map((question, index) => (
                                <li key={index}>{question}</li>
                            ))}
                        </ul>
                        <hr style={{ borderColor: 'grey', borderWidth: '1px', borderStyle: 'solid', marginBottom: '10px' }} />
                    </div>
                    <SuggestiveSearch
                        handleTextChange={textChange}
                        questions={allQuestions.current}
                        textInputValue={textInputValue}
                    />
                    <form onSubmit={e => {
                        e.preventDefault();
                        submitResponse(e, "SEARCH");

                    }}>
                        <button
                            type="submit"
                            className="ui linkedin button shhh-submit-button"
                            style={{ background: "#614CB8" }}
                        >
                            <i aria-hidden="true" class="send icon"></i>
                        </button>
                    </form>
                </div>

            </div>
            <NotificationContainer />
        </div>
    );
}
export default ShhhPlayer;