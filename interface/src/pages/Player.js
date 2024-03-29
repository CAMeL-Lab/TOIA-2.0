import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import VoiceOverOffRoundedIcon from "@mui/icons-material/VoiceOverOffRounded";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import history from "../services/history";
import SuggestiveSearch from "../suggestiveSearch/suggestiveSearch";
import speechToTextUtils from "../transcription_utils";
import PopModal from "../userRating/popModal";
import Tracker from "../utils/tracker";

import NavBar from "./NavBar.js";

import { useTranslation } from "react-i18next";
import VideoPlaybackPlayer from "./sub-components/Videoplayback.Player";
import i18n from "i18next";
import { getUser, isLoggedIn } from "../auth/auth";
import API_URLS from "../configs/backend-urls";
import {
	languageCodeTable,
	languageFlagsCSS,
} from "../services/languageHelper";

function Player() {
	const { t } = useTranslation();

	const [toiaName, setName] = React.useState(null);
	const [toiaLanguage, setLanguage] = React.useState(null);
	const [interactionLanguage, setInteractionLanguage] = useState(
		languageCodeTable?.[i18n.language] || "en-US",
	);
	const [toiaID, setTOIAid] = React.useState(null);
	const [loginState, setLoginState] = useState(false);

	const [toiaFirstNameToTalk, setTOIAFirstNameToTalk] = useState(null);
	const [toiaLastNameToTalk, setTOIALastNameToTalk] = useState(null);
	const [streamNameToTalk, setStreamNameToTalk] = useState(null);
	const [fillerPlaying, setFillerPlaying] = useState(true);

	const [answeredQuestions, setAnsweredQuestions] = useState([]);
	const [allSuggestedQuestions, setAllSuggestedQuestions] = useState([]);

	const [videoProperties, setVideoProperties] = useState(null);
	const [hasRated, setHasRated] = useState(true); // controll the rating field
	const [transcribedAudio, setTranscribedAudio] = useState("");
	const [ratingParams, setRatingParams] = useState({
		active: false,
	});

	// suggested questions for cards

	const textInput = useRef("");
	const question = useRef("");
	const interacting = useRef("false");
	const isFillerPlaying = useRef("true");
	const allQuestions = useRef([]);
	const shouldRefreshQuestions = useRef(false); // flag to indicate that the SuggestionCard module needs to refresh questions

	const interimTextInput = useRef("");

	const [micMute, setMicStatus] = useState(true);
	const [micString, setMicString] = useState("ASK BY VOICE");

	const [ratingNodes, setRatingNodes] = useState([
		{
			text: "How well does this answer fit with your question or the conversation you're having with the avatar?",
			rating: 5,
			onSubmitRating: recordUserRating,
		},
		{
			text: "How well do the subtitles reflect what is being said?",
			rating: 5,
			onSubmitRating: recordSubtitlesRating,
		},
	]);

	useEffect(() => {
		if (isLoggedIn()) {
			setName(getUser().first_name);
			setLanguage(getUser().language);
			setTOIAid(getUser().id);
			setLoginState(true);
		} else {
			setLoginState(false);
		}

		setTOIAFirstNameToTalk(history.location.state.toiaFirstNameToTalk);
		setTOIALastNameToTalk(history.location.state.toiaLastNameToTalk);
		setStreamNameToTalk(history.location.state.streamNameToTalk);

		canAccessStream();

		// fetchAnsweredQuestions();
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

	function canAccessStream() {
		let streamID = history.location.state.streamToTalk;

		const options = {
			method: "GET",
			url: API_URLS.STREAM_INFO(streamID),
		};

		axios.request(options).catch(function (error) {
			if (error.response.status === 401) {
				alert("You do not have permission to access this stream");
				history.push({
					pathname: "/library",
				});
			} else {
				console.error(error);
				alert("Something went wrong");
				history.push({
					pathname: "/library",
				});
			}
		});
	}

	// if user asks one of the suggested questions
	function askQuestionFromCard(question) {
		if (!hasRated) {
			NotificationManager.warning(
				"Please provide a rating, or skip",
				"",
				3000,
			);
			return;
		}

		const mode = "CARD";

		const oldQuestion = question;
		console.log(oldQuestion);
		getVideoData(mode, oldQuestion.question);
	}
	// Function ends here

	// handling data recieved from server
	function handleDataReceived(data) {
		// setting the transcribedAudio
		if (data) {
			setTranscribedAudio(data.alternatives[0].transcript);
			if (data.isFinal) {
				question.current = data.alternatives[0].transcript;

				speechToTextUtils.stopRecording();
				fetchData("VOICE");
			}
		} else {
			console.log("no data received from server");
		}
	}

	// Sets the value of 'allQuestions' array
	// to be the string list of all questions of the stream
	function fetchAllStreamQuestions() {
		const options = {
			method: "GET",
			url: API_URLS.STREAM_ANSWERED_QUESTIONS(
				history.location.state.streamToTalk,
			),
		};

		axios
			.request(options)
			.then(res => {
				res.data = res.data.filter(
					item =>
						item.suggested_type === "y/n-answer" ||
						item.suggested_type === "answer",
				);
				allQuestions.current = res.data || [];
			})
			.catch(err => {
				console.log(err);
			});
	}
	// function to fetch answered smart questions from the database
	// question: the last question asked by the user
	// answer: the answer given by the avatar
	function fetchAnsweredQuestions(question = "", answer = "") {
		axios
			.post(
				API_URLS.SMART_QUESTIONS(history.location.state.streamToTalk),
				{
					params: {
						latest_question: question,
						latest_answer: answer,
					},
				},
			)
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
						q.question !== "" &&
						!allSuggestedQuestions.includes(q)
					) {
						answeredQuestions.push(q);
						allSuggestedQuestions.push(q);
						// setAllSuggestedQuestions([...allSuggestedQuestions, q]);
					}
				});

				shouldRefreshQuestions.current = true;
				setAnsweredQuestions([...answeredQuestions]);
				setAllSuggestedQuestions([...allSuggestedQuestions]);
			});
	}

	function textInputChange(val) {
		if (val && val.question) {
			textInput.current = val.question;
		} else if (typeof val === "string") {
			textInput.current = val;
		}
	}

	useEffect(() => {
		if (hasRated) {
			if (interacting.current == "true") {
				const params = {
					language: interactionLanguage,
					// language: "ko-KR"
				};
				speechToTextUtils.initRecording(
					params,
					handleDataReceived,
					error => {
						console.error("Error when transcribing", error);
					},
				);
			}
		}
	}, [hasRated]);

	// TODO: Refactor recordUserRating and recordSubtitlesRating (difference is the subject)
	function recordUserRating(ratingValue, ratingParams, interactionLanguage) {
		const options = {
			method: "POST",
			url: API_URLS.SAVE_FEEDBACK(),
			headers: { "Content-Type": "application/json" },
			data: {
				video_id: ratingParams.video_id,
				question: ratingParams.question,
				rating: ratingValue,
				video_language: ratingParams.video_language,
				interactor_language: interactionLanguage,
				similarity_score: ratingParams.similarity_score,
				subject: "Dialogue",
			},
		};

		axios
			.request(options)
			.then(function (response) {
				// console.log(response.data);
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	function recordSubtitlesRating(
		ratingValue,
		ratingParams,
		interactionLanguage,
	) {
		const options = {
			method: "POST",
			url: "/api/save_player_feedback",
			headers: { "Content-Type": "application/json" },
			data: {
				...(history.location.state.toiaID && {
					user_id: history.location.state.toiaID,
				}),
				video_id: ratingParams.video_id,

				question: ratingParams.question,
				rating: ratingValue,
				video_language: ratingParams.video_language,
				interactor_language: interactionLanguage,
				similarity_score: ratingParams.similarity_score,
				subject: "Subtitles",
			},
		};

		axios
			.request(options)
			.then(function (response) {
				// console.log(response.data);
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	function fetchData(mode = "UNKNOWN") {
		if (!hasRated) {
			NotificationManager.warning("Please provide a rating", "", 3000);
			return;
		}

		const oldQuestion = question.current;
		console.log("old question", oldQuestion);
		if (question.current === null || question.current === "") {
			setFillerPlaying(true);
			fetchFiller();
		} else {
			getVideoData(mode, oldQuestion);
		}
	}

	function getVideoData(mode, oldQuestion) {
		console.log("Getting Video...");
		const streamID = history.location.state.streamToTalk;
		axios
			.post(
				API_URLS.NEXT_VIDEO(streamID, oldQuestion),
				{
					params: {
						mode: mode,
						language: interactionLanguage,
					},
				},
				{
					timeout: 10000,
				},
			)
			.then(res => {
				if (res.data === "error") {
					console.log("No video found!");
					setFillerPlaying(true);
				} else {
					res.data["video_id"] = res.data["id_video"];
					delete res.data["id_video"];
					console.log("Got Video!");
					setFillerPlaying(true);

					isFillerPlaying.current = "false";
					console.log("Video id");
					console.log(res.data.video_id);
					// fetchAnsweredQuestions(oldQuestion, res.data.answer);
					setVideoProperties({
						key: res.data.url + new Date(),
						onEnded: () => {
							// Temporarily disabled
							// setRatingParams({
							// 	video_id: res.data.video_id,
							// 	video_language: res.data.language,
							// 	question: oldQuestion,
							// 	similarity_score: res.data.similarity_score
							// });
							// setHasRated(false);
							fetchFiller();
						},
						source: res.data.url,
						source_vtt: res.data.vtt_url,
						fetchFiller: fetchFiller,
						muted: false,
						filler: false,
						duration_seconds: res.data.duration_seconds || null,
						question: question.current,
						video_id: res.data.video_id,
						language: res.data.language,
					});

					setTranscribedAudio("");
				}
			})
			.catch(e => {
				setFillerPlaying(true);
				console.error(e);
			});
	}

	function endTranscription() {
		speechToTextUtils.stopRecording();
	}

	function micStatusChange() {
		if (micMute === true) {
			setMicStatus(false);

			setMicString("STOP ASK BY VOICE");
			interacting.current = "true";

			if (hasRated) {
				const params = {
					language: interactionLanguage,
					// language: "ko-KR"
				};
				speechToTextUtils.initRecording(
					params,
					handleDataReceived,
					error => {
						console.error("Error when transcribing", error);
						// No further action needed, as stream already closes itself on error
					},
				);
			} else {
				NotificationManager.warning(
					"Please provide a rating",
					"",
					3000,
				);
			}
		} else {
			speechToTextUtils.stopRecording();
			setMicStatus(true);

			setMicString("ASK BY VOICE");
			interacting.current = "false";
		}
	}

	function fetchFiller() {
		isFillerPlaying.current = "true";
		if (fillerPlaying) {
			axios
				.get(
					API_URLS.STREAM_FILLER(history.location.state.streamToTalk),
				)
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
		if (!hasRated) {
			NotificationManager.warning("Please provide a rating", "", 3000);
			return;
		}

		question.current = textInput.current
			? textInput.current
			: interimTextInput.current;

		if (question.current !== "") {
			// const oldQuestion = question.current;
			getVideoData(mode, question.current);
		}
	}

	return (
		<div className="player">
			<NavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={loginState}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={true}
				endTranscription={endTranscription}
			/>
			{!hasRated && (
				<PopModal
					ratingNodes={ratingNodes}
					setRatingNodes={setRatingNodes}
					hasRated={hasRated}
					setHasRated={setHasRated}
					ratingParams={ratingParams}
					interactionLanguage={interactionLanguage}
				/>
			)}
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
							classNames="fade">
							<VideoPlaybackPlayer
								onEnded={videoProperties.onEnded}
								key={videoProperties.key}
								muted={
									videoProperties.muted
										? videoProperties.muted
										: false
								}
								source={videoProperties.source}
								source_vtt={videoProperties.source_vtt}
								// filler={videoProperties.filler}
								// duration_seconds={
								// 	videoProperties.duration_seconds
								// }
								lang={videoProperties.language}
							/>
						</CSSTransition>
					</TransitionGroup>
				)}
				{micMute ? (
					<div>
						<div class="lang-container">
							<div class="lang-dropdown">
								<div class="lang-dropbtn">
									<span
										className={
											languageFlagsCSS[
												interactionLanguage
											]
										}></span>
								</div>
								<div class="lang-dropdown-content">
									<a
										href="#"
										onClick={() =>
											setInteractionLanguage("en-US")
										}>
										<span class="fi fi-us"></span>
									</a>
									<a
										href="#"
										onClick={() =>
											setInteractionLanguage("ar-AE")
										}>
										<span class="fi fi-ae"></span>
									</a>
									{/* <a href="#"><span class="fi fi-es"></span>SP</a> */}
									<a
										href="#"
										onClick={() =>
											setInteractionLanguage("es-ES")
										}>
										<span class="fi fi-es"></span>
									</a>
									<a
										href="#"
										onClick={() =>
											setInteractionLanguage("fr-FR")
										}>
										<span class="fi fi-fr"></span>
									</a>
								</div>
							</div>
						</div>
						<button
							color="green"
							className="ui linkedin microphone button mute-button"
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
							{micString}
						</button>
					</div>
				) : (
					<button
						className="ui secondary button mute-button"
						onClick={micStatusChange}>
						<i aria-hidden="true" class="">
							<VoiceOverOffRoundedIcon />
						</i>
						{micString}
					</button>
				)}

				{isFillerPlaying.current === "false" ? (
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

							{/* <SuggestionCard
								questions={answeredQuestions}
								askQuestion={askQuestionFromCard}
								shouldRefreshQuestions={shouldRefreshQuestions}
								setRefreshQuestionsFalse={
									setRefreshQuestionsFalse
								}
								hasRated={hasRated}
								notificationManager={NotificationManager}
							/> */}

							<button
								color="green"
								className="ui linkedin button submit-button"
								onClick={e => {
									submitResponse(e, "SEARCH");
								}}>
								<i aria-hidden="true" class="send icon"></i>
								ASK
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
