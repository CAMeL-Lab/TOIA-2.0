
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import VoiceOverOffRoundedIcon from "@mui/icons-material/VoiceOverOffRounded";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Modal } from "semantic-ui-react";
import history from "../services/history";
import SuggestionCard from "../suggestiveSearch/suggestionCards";
import SuggestiveSearch from "../suggestiveSearch/suggestiveSearch";
import speechToTextUtils from "../transcription_utils";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";

import PopModal from "../userRating/popModal";
import SuggestiveSearch from "../suggestiveSearch/suggestiveSearch";

import NavBar from './NavBar.js';

import i18n from "i18next";
import { Trans, useTranslation } from "react-i18next";

function Player() {

	const { t } = useTranslation();

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
	let allSuggestedQuestions = [];

	const [videoProperties, setVideoProperties] = useState(null);
	const [isInteracting, setIsInteracting] = useState(false);

	const [hasRated, setHasRated] = useState(true); // controll the rating field
	const [ratingVal, setRatingVal] = useState(1);
	const [videoURL, setVideoURL] = useState(null);

	const [transcribedAudio, setTranscribedAudio] = useState("");

	const [lastQAsked, setlastQAsked] = useState("");
	const [lastPlayedVideo, setLastPlayedVideo] = useState(null);

	// suggested questions for cards

	const textInput = React.useRef("");
	const question = React.useRef("");
	const interacting = React.useRef("false");
	const newRating = React.useRef("true");
	const isFillerPlaying = React.useRef("true");
	const allQuestions = React.useRef([]);
	const shouldRefreshQuestions = React.useRef(false); // flag to indicate that the SuggestionCard module needs to refresh questions

	const questionsLength = React.useRef(0);
	const interimTextInput = React.useRef("");

	var input1, input2;
	let [micMute, setMicStatus] = React.useState(true);
	let [micString, setMicString] = React.useState("ASK BY VOICE");

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
		fetchAllStreamQuestions();

		fetchFiller();
		// Tracker
		new Tracker().startTracking(history.location.state);
	}, []);


	useEffect(() => {
		const listener = (event) => {
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
			.then(function (response) {})
			.catch(function (error) {
				alert("You do not have permission to access this page");
				library();
			});
	}
	// if user asks one of the suggested questions
	function askQuestionFromCard(question) {
		if (!hasRated){
			NotificationManager.warning("Please provide a rating", "", 3000);
			return;
		}

		const mode = "CARD";

		const oldQuestion = question;
		console.log(oldQuestion);
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
					mode: mode
				},
			})
			.then((res) => {
				if (res.data === "error") {
					setFillerPlaying(true);
					console.log("error");
				} else {
					setFillerPlaying(true);
					setHasRated(false);

					isFillerPlaying.current = "false";
					newRating.current = "false";
					setlastQAsked(oldQuestion.question);
					setVideoProperties({
						key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
						onEnded:fetchFiller,
						source: res.data.url,
						fetchFiller: fetchFiller,
						muted: false,
						filler: false,
						duration_seconds: res.data.duration_seconds || null
					});

					setLastPlayedVideo(res.data.video_id);
					fetchAnsweredQuestions(oldQuestion.question, res.data.answer || '');
					setVideoURL(res.data.url); // setting the video ID
					setTranscribedAudio("");
					// question.current = "";
				}
			});
	}
	// Function ends here

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
				setlastQAsked(data.alternatives[0].transcript);
				setHasRated(false);

				speechToTextUtils.stopRecording();
				fetchData("VOICE");
			}
		} else {
			console.log("no data received from server");
		}
	}

	// Sets the value of 'allQuestions' array
	// to be the string list of all questions of the stream
	function fetchAllStreamQuestions(){
		console.log("Fetching all questions!");
		axios.get(`/api/questions/answered_filtered/${history.location.state.toiaToTalk}/${history.location.state.streamToTalk}`)
		.then((res)=>{
			allQuestions.current = res.data || [];
		});
	}
	// function to fetch answered smart questions from the database
	// question: the last question asked by the user
	// answer: the answer given by the avatar
	function fetchAnsweredQuestions(question="", answer="") {
		console.log(`Creating Smart Questions...\n question = ${question}\n`);
		axios.post('/api/getSmartQuestions', {
			params: {
				toiaIDToTalk: history.location.state.toiaToTalk,
				toiaFirstNameToTalk: history.location.state.toiaFirstNameToTalk,
				avatar_id: history.location.state.toiaToTalk,
				stream_id: history.location.state.streamToTalk,
				latest_question: question,
				latest_answer: answer
			}
		}).then((res)=>{
			// res.data contains the smart questions generated
			// If res.data is not an array, then there is an error, so stop.
			if (res.data.constructor !== Array){
				return;
			}
			
			res.data.forEach((q) => {

				// If the question is not an empty string AND has not been previously asked AND is not in the current list of possible questions
				// then add it to the list of possible suggestions
				if (q.question != '' && !allSuggestedQuestions.includes(q)){
					answeredQuestions.push(q);
					allSuggestedQuestions.push(q);
				}
			});
			console.log("Created Smart Questions.");
			console.log(answeredQuestions);
			console.log("=========================")
			shouldRefreshQuestions.current = true;
			setAnsweredQuestions([...answeredQuestions]);
		});
	}


	function textInputChange(val) {
		if (val && val.question) {
			textInput.current = val.question;
			console.log("AYOOOO", textInput.current);
		} else if (typeof val === "string") {
			textInput.current = val;
		}
	}

	const recordUserRating = function (rate) {
		// record the rating for the user
		const vidID = lastPlayedVideo;
		console.log(vidID);

		if (vidID){
			const options = {
				method: "POST",
				url: "/api/save_player_feedback",
				headers: { "Content-Type": "application/json" },
				data: {
					...(history.location.state.toiaID && {
						user_id: history.location.state.toiaID,
					}),
					video_id: vidID,
	
					question: lastQAsked,
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
		} else {
			console.error("Video ID not defined for rating")
		}

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

	function fetchData(mode="UNKNOWN") {
		if (!hasRated){
			NotificationManager.warning("Please provide a rating", "", 3000);
			return;
		}


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
						mode: mode
					},
				})
				.then((res) => {
					if (res.data === "error") {
						setFillerPlaying(true);
					} else {
						setFillerPlaying(true);

						setHasRated(false);
						newRating.current = "false";
						setlastQAsked(oldQuestion);
						isFillerPlaying.current = "false";
						setVideoURL(res.data.url); // setting the video ID
						fetchAnsweredQuestions(oldQuestion, res.data.answer);
						setVideoProperties({
							key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
							onEnded:
								interacting.current == "false"
									? fetchFiller
									: chatFiller,
							source: res.data.url,
							fetchFiller: fetchFiller,
							muted: false,
							filler: false,
							duration_seconds: res.data.duration_seconds || null
						});
						setLastPlayedVideo(res.data.video_id);

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

			setMicString("STOP ASK BY VOICE");
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

			setMicString("ASK BY VOICE");
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
						streamIdToTalk: history.location.state.streamToTalk,
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
						duration_seconds: null
					});

					setVideoURL(res.data);

					document.getElementById("vidmain").load();
					const playPromise = document
						.getElementById("vidmain")
						.play();
					if (playPromise !== undefined) {
						playPromise
							.then((_) => {
								// Automatic playback started!
								// Show playing UI.

							})
							.catch((error) => {
								// Auto-play was prevented
								// Show paused UI.


								fetchFiller();
							});
					}
				});
		}
	}

	function setRefreshQuestionsFalse(){
		shouldRefreshQuestions.current = false;
	}

	function textChange(e) {
		textInput.current = e.target.value;
		interimTextInput.current = textInput.current;
	}

	function submitResponse(e, mode="UNKNOWN") {
		if (!hasRated){
			NotificationManager.warning("Please provide a rating", "", 3000);
			return;
		}


		question.current = textInput.current
			? textInput.current
			: interimTextInput.current;

		if (question.current != "") {
			setHasRated(false);
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
						mode: mode
					},
				})
				.then((res) => {
					if (res.data === "error") {
						setFillerPlaying(true);
					} else {
						setFillerPlaying(true);
						setHasRated(false);

						newRating.current = "false";
						setlastQAsked(oldQuestion)
						isFillerPlaying.current = "false";

						setVideoProperties({
							key: res.data.url + new Date(), // add timestamp to force video transition animation when the key hasn't changed
							onEnded: fetchFiller,
							source: res.data.url,
							muted: false,
							filler: false,
							duration_seconds: res.data.duration_seconds || null
						});
						setLastPlayedVideo(res.data.video_id);

						fetchAnsweredQuestions(oldQuestion, res.data.answer);
						setVideoURL(res.data.url); // setting the video ID
						// transcribedAudio.current = '';
						setTranscribedAudio("");
						question.current = "";
					}
				})
				.catch((e) => {
					console.error(e);
				})
		}
	}

	const inlineStyle = {
		modal: {
			height: "560px",
			width: "600px",
		},
	};

	return (
		<div className="player">
			{NavBar(toiaName, toiaID, toiaLanguage, isLoggedIn, history, dispatch, open, t)}
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
								duration_seconds={videoProperties.duration_seconds}
							/>
						</CSSTransition>
					</TransitionGroup>
				)}
				{micMute ? (
					<button
						color="green"
						className="ui linkedin microphone button mute-button"
						onClick={micStatusChange}
					>
						<i aria-hidden="true" class="">
							<RecordVoiceOverRoundedIcon
								sx={{
									paddingTop: "0px",
									paddingRight: "0px",
									fontSize: "1.7rem",
								}}
							/>
						</i>
						{micString}
					</button>
				) : (
					<button
						className="ui secondary button mute-button"
						onClick={micStatusChange}
					>
						<i aria-hidden="true" class="">
							<VoiceOverOffRoundedIcon />
						</i>
						{micString}
					</button>
				)}

				{isFillerPlaying.current == "false" ? (
					<button
						className="ui inverted button skip-end-button"
						onClick={
							interacting.current == "false"
								? fetchFiller
								: chatFiller
						}
					>
						{" "}
						Skip to End{" "}
						<i
							aria-hidden="true"
							class="angle double right icon"
						></i>
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
								shouldRefreshQuestions = {shouldRefreshQuestions}
								setRefreshQuestionsFalse = {setRefreshQuestionsFalse}
								hasRated = {hasRated}
								notificationManager = {NotificationManager}
							/>

							<button
								color="green"
								className="ui linkedin button submit-button"
								onClick={(e) => {
									submitResponse(e, "SEARCH");
								}}
							>
								<i aria-hidden="true" class="send icon"></i>ASK
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

export default Player;
