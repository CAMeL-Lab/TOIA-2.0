import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import VoiceOverOffRoundedIcon from "@mui/icons-material/VoiceOverOffRounded";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import { Label, Modal } from "semantic-ui-react";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import SuggestionCard from "../suggestiveSearch/suggestionCards";
import SuggestiveSearch from "../suggestiveSearch/suggestiveSearch";
import speechToTextUtils from "../transcription_utils";
import PopModal from "../userRating/popModal";
import Tracker from "../utils/tracker";

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
	const [answeredQuestions, setAnsweredQuestions] = useState(["Loading ..."]);

	const [video, setVideo] = useState(null);
	const [isInteracting, setIsInteracting] = useState(false);

	const [hasRated, setHasRated] = useState(true); // controll the rating field
	const [ratingVal, setRatingVal] = useState(1);
	const [videoID, setVideoID] = useState(null);

	const [transcribedAudio, setTranscribedAudio] = useState("");

	// suggested questions for cards
	const [suggestion2, setSuggestion2] = React.useState("");

	const textInput = React.useRef("");
	const question = React.useRef("");
	const interacting = React.useRef("false");
	const newRating = React.useRef("true");
	const isFillerPlaying = React.useRef("true");
	const questionsLength = React.useRef(0);
	const interimTextInput = React.useRef("");

	var input1, input2;
	let [micMute, setMicStatus] = React.useState(true);
	let [micString, setMicString] = React.useState("ASK BY VOICE");

	useEffect(() => {
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
		fetchAnsweredQuestions();

		fetchFiller();
		// Tracker
		new Tracker().startTracking(history.location.state);
	}, []);

	useEffect(() => {
		const listener = (event) => {
			if (event.code === "Enter" || event.code === "NumpadEnter") {
				event.preventDefault();

				submitResponse();
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

	// if user asks one of the suggested questions
	function askQuestionFromCard(question, suggestionNumber) {
		const oldQuestion = question.current;
		axios
			.post(`/api/player`, {
				params: {
					toiaIDToTalk: history.location.state.toiaToTalk,
					toiaFirstNameToTalk:
						history.location.state.toiaFirstNameToTalk,
					question,
					streamIdToTalk: history.location.state.streamToTalk,
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
					setVideo(
						<video
							className="player-vid"
							id="vidmain"
							key={transcribedAudio}
							onEnded={fetchFiller}
							autoPlay
						>
							<source
								src={res.data}
								onEnded={fetchFiller}
								type="video/mp4"
							></source>
						</video>
					);

					setVideoID(res.data); // setting the video ID
					setTranscribedAudio("");
					question.current = "";
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
			.get(
				`http://localhost:3001/api/questions/answered/${history.location.state.toiaToTalk}`
			)
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

				questionsLength.current =
					answeredQuestionsData.length >= 3
						? 3
						: answeredQuestionsData.length;
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
			url: "http://localhost:3001/api/save_player_feedback",
			headers: { "Content-Type": "application/json" },
			data: {
				...(history.location.state.toiaID && {
					user_id: history.location.state.toiaID,
				}),
				video_id: vidID[vidID.length - 1],
				question: question.current,
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
					},
				})
				.then((res) => {
					if (res.data === "error") {
						setFillerPlaying(true);
					} else {
						setFillerPlaying(true);
						//setHasRated(false);
						newRating.current = "false";
						isFillerPlaying.current = "false";
						setVideoID(res.data); // setting the video ID
						setVideo(
							<video
								className="player-vid"
								id="vidmain"
								key={transcribedAudio}
								onEnded={
									interacting.current == "false"
										? fetchFiller
										: chatFiller
								}
								autoPlay
							>
								<source
									src={res.data}
									onEnded={fetchFiller}
									type="video/mp4"
								></source>
							</video>
						);

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
						toiaFirstNameToTalk:
							history.location.state.toiaFirstNameToTalk,
					},
				})
				.then(async (res) => {
					let videoELem = (
						<video
							muted
							className="player-vid"
							id="vidmain"
							key="filler"
							onEnded={
								interacting.current == "false"
									? fetchFiller
									: chatFiller
							}
							autoPlay
						>
							<source src={res.data} type="video/mp4"></source>
						</video>
					);
					setVideo(videoELem);
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

	function textChange(e) {
		textInput.current = e.target.value;
		interimTextInput.current = textInput.current;
	}

	function submitResponse(e) {
		// if hasRated == true then you can sumbit

		question.current = textInput.current
			? textInput.current
			: interimTextInput.current;

		if (question.current != "") {
			setHasRated(false);
			axios
				.post(`/api/player`, {
					params: {
						toiaIDToTalk: history.location.state.toiaToTalk,
						toiaFirstNameToTalk:
							history.location.state.toiaFirstNameToTalk,
						question,
						streamIdToTalk: history.location.state.streamToTalk,
					},
				})
				.then((res) => {
					if (res.data === "error") {
						setFillerPlaying(true);
					} else {
						setFillerPlaying(true);
						setHasRated(false);

						isFillerPlaying.current = "false";
						setVideo(
							<video
								className="player-vid"
								id="vidmain"
								key={transcribedAudio}
								onEnded={fetchFiller}
								autoPlay
							>
								<source
									src={res.data}
									onEnded={fetchFiller}
									type="video/mp4"
								></source>
							</video>
						);

						setVideoID(res.data); // setting the video ID
						// transcribedAudio.current = '';
						setTranscribedAudio("");
						question.current = "";
					}
				});
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
		if (isLoggedIn) {
			endTranscription();
			history.push({
				pathname: "/library",
				state: {
					toiaName,
					toiaLanguage,
					toiaID,
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
				<Label className="player-lang player-font-class-2">
					{streamNameToTalk}
				</Label>
				{video}
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
									questions={[...answeredQuestions]}
								/>
							)}

							<SuggestionCard
								questions={[...answeredQuestions]}
								suggestedQuestion2={setSuggestion2}
								askQuestion={askQuestionFromCard}
							/>

							<button
								color="green"
								className="ui linkedin button submit-button"
								onClick={submitResponse}
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
