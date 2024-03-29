import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import React, { useState } from "react";
import Carousel from "react-elastic-carousel";
import {
	NotificationContainer,
	NotificationManager,
} from "react-notifications";
import { Button, Confirm, Input, Modal } from "semantic-ui-react";
import addButton from "../icons/add-button.svg";
import moveIcon from "../icons/move-button.svg";
import trashIcon from "../icons/trash-button.svg";
import history from "../services/history";

import "@brainhubeu/react-carousel/lib/style.css";
import axios from "axios";
import Tracker from "../utils/tracker";
import "./AvatarGardenPage.css";

import NavBar from "./NavBar.js";

import { useBottomScrollListener } from "react-bottom-scroll-listener";

import { useTranslation } from "react-i18next";
import { getUser, isLoggedIn } from "../auth/auth";
import API_URLS from "../configs/backend-urls";

export const renderSuggestedQsCard = (card, index, onClickFunc) => {
	// const { t } = useTranslation();

	return (
		<div className="row" id={card.id_question}>
			<div
				onClick={e => {
					onClickFunc(e, card);
				}}
				className="column round-styling-first"
				style={{
					backgroundImage: `url(${card.pic})`,
					cursor: `pointer`,
					backgroundSize: "132px 138.6px",
				}} //video thumbnail
			/>
			<div className="column garden-question round-styling-second">
				<h1
					className="garden-name garden-font-class-5" //question
					style={{ marginTop: "10px" }}>
					{card.question}
				</h1>
			</div>
		</div>
	);
};

export const RecordAVideoCard = ({ onClick, isDisabled }) => {
	const { t } = useTranslation();

	return (
		<div
			data-tooltip={isDisabled ? t("record_request") : undefined}
			data-inverted=""
			onClick={e => {
				if (!isDisabled) onClick(e);
			}}>
			<div
				className={
					"ui card " +
					(isDisabled ? "cursor-disabled" : "cursor-pointer")
				}>
				<div className="image">
					<img alt="" src={addButton} />

					<button
						className="ui bottom attached button fluid"
						disabled={isDisabled}
						onClick={e => {
							if (!isDisabled) onClick(e);
						}}>
						{t("add_new_video")}
					</button>
				</div>
			</div>
		</div>
	);
};

export const OnBoardingQCard = ({ data, onClick }) => {
	const { t } = useTranslation();

	return (
		<div>
			<div className="ui red card cursor-pointer" onClick={onClick}>
				<div className="content">
					<div className="description three-line-ellipsis">
						{data.question}
					</div>
				</div>
				<div className="ui bottom attached button">
					<i className="add icon" />
					{t("record")}
				</div>
			</div>
		</div>
	);
};

export const SuggestedQCard = ({
	data,
	onClick,
	onEdit,
	onDelete,
	isDisabled,
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-tooltip={isDisabled ? t("record_request") : undefined}
			data-inverted="">
			<div
				className={
					"ui grey card " +
					(isDisabled ? "cursor-disabled" : "cursor-pointer")
				}>
				<div className="content" onClick={onClick}>
					<div className="description two-line-ellipsis">
						{data.question}
					</div>
				</div>
				<div className="extra content">
					<div className="ui two">
						<button
							className="ui labeled icon button tiny"
							disabled={isDisabled}
							onClick={onEdit}>
							<i className="edit icon" />
							{t("edit")}
						</button>
						<button
							className="ui labeled icon button basic brown tiny"
							disabled={isDisabled}
							onClick={onDelete}>
							{t("delete")}
							<i className="trash arrow icon" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export const SuggestedQCardNoAction = ({ data, onClick, isDisabled }) => {
	const { t } = useTranslation();

	return (
		<div
			data-tooltip={isDisabled ? t("record_request") : undefined}
			data-inverted="">
			<div className="ui grey card cursor-pointer" onClick={onClick}>
				<div className="content">
					<div className="description three-line-ellipsis">
						{data.question}
					</div>
				</div>
				<div className="ui bottom attached button">
					<i className="add icon" />
					{t("record")}
				</div>
			</div>
		</div>
	);
};

export const RecordedQCard = ({ data, onClick, onEdit, onDelete }) => {
	const { t } = useTranslation();

	return (
		<div>
			<div className="ui card bg-toia-theme cursor-pointer">
				<div className="content" onClick={onClick}>
					<div className="description text-white two-line-ellipsis">
						{data.question}
					</div>
				</div>
				<div className="extra content">
					<div className="ui two">
						<button
							className="ui labeled icon button tiny"
							onClick={onEdit}>
							<i className="edit icon" />
							{t("edit")}
						</button>
						<button
							className="ui labeled icon button tiny"
							onClick={onDelete}>
							{t("delete")}
							<i className="trash arrow icon red" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// export const renderSuggestedQsCard = (card, index, onClickFunc) => {
//     return (
//         <div className="row" id={card.id_question}>
//             <div onClick={(e) => {
//                 onClickFunc(e, card)
//             }} className="column round-styling-first" style={{
//                 backgroundImage: `url(${card.pic})`,
//                 cursor: `pointer`,
//                 backgroundSize: "132px 138.6px"
//             }} //video thumbnail
//             />
//             <div className="column garden-question round-styling-second">
//                 <h1 className="garden-name garden-font-class-5" //question
//                     style={{marginTop: "10px"}}>{card.question}</h1>
//             </div>
//         </div>
//     )
// }

// export const RecordAVideoCard = ({onClick, isDisabled}) => {
//     return (
//         <div data-tooltip={(isDisabled) ? "Please record the required ones first" : undefined}
//              data-inverted=""
//              onClick={(e) => {
//                  if (!isDisabled) onClick(e);
//              }}>
//             <div className={"ui card " + ((isDisabled) ? "cursor-disabled" : "cursor-pointer")}>
//                 <div className="image">
//                     <img alt=""
//                          src={addButton}/>

//                     <button className="ui bottom attached button fluid"
//                             disabled={isDisabled}
//                             onClick={(e) => {
//                                 if (!isDisabled) onClick(e);
//                             }}>
//                         Add new video
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export const OnBoardingQCard = ({data, onClick}) => {
//     return (
//         <div>
//             <div className="ui red card cursor-pointer" onClick={onClick}>
//                 <div className="content">
//                     <div className="description three-line-ellipsis">
//                         {data.question}
//                     </div>
//                 </div>
//                 <div className="ui bottom attached button">
//                     <i className="add icon"/>
//                     Record
//                 </div>
//             </div>
//         </div>
//     )
// }

// export const SuggestedQCard = ({data, onClick, onEdit, onDelete, isDisabled}) => {
//     return (
//         <div data-tooltip={(isDisabled) ? "Please record the required ones first" : undefined} data-inverted="">
//             <div className={"ui grey card " + ((isDisabled) ? "cursor-disabled" : "cursor-pointer")}>
//                 <div className="content" onClick={onClick}>
//                     <div className="description two-line-ellipsis">
//                         {data.question}
//                     </div>
//                 </div>
//                 <div className="extra content">
//                     <div className="ui two">
//                         <button className="ui labeled icon button tiny" disabled={isDisabled} onClick={onEdit}>
//                             <i className="edit icon"/>
//                             Edit
//                         </button>
//                         <button className="ui labeled icon button basic brown tiny" disabled={isDisabled}
//                                 onClick={onDelete}>
//                             Delete
//                             <i className="trash arrow icon"/>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export const SuggestedQCardNoAction = ({data, onClick, isDisabled}) => {
//     return (
//         <div data-tooltip={(isDisabled) ? "Please record the required ones first" : undefined} data-inverted="">
//             <div className="ui grey card cursor-pointer" onClick={onClick}>
//                 <div className="content">
//                     <div className="description three-line-ellipsis">
//                         {data.question}
//                     </div>
//                 </div>
//                 <div className="ui bottom attached button">
//                     <i className="add icon"/>
//                     Record
//                 </div>
//             </div>
//         </div>
//     )
// }

// export const RecordedQCard = ({data, onClick, onEdit, onDelete}) => {
//     return (
//         <div>
//             <div className="ui card bg-toia-theme cursor-pointer">
//                 <div className="content" onClick={onClick}>

//                     <div className="description text-white two-line-ellipsis">
//                         {data.question}
//                     </div>
//                 </div>
//                 <div className="extra content">
//                     <div className="ui two">
//                         <button className="ui labeled icon button tiny" onClick={onEdit}>
//                             <i className="edit icon"/>
//                             Edit
//                         </button>
//                         <button className="ui labeled icon button tiny" onClick={onDelete}>
//                             Delete
//                             <i className="trash arrow icon red"/>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

function AvatarGardenPage() {
	const { t, i18n } = useTranslation();

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [streamList, setStreamList] = useState([]);
	const [currentStream, setCurrentStream] = useState(undefined);
	const [suggestedQsList, setSuggestedQsList] = useState([]);
	const [pendingOnBoardingQs, setPendingOnBoardingQs] = useState([]);
	const [recordedQsList, setRecordedQsList] = useState([]);

	const [newStreamName, setNewStreamName] = useState(null);
	const [newStreamPrivacy, setNewStreamPrivacy] = useState("public");
	const [newStreamBio, setNewStreamBio] = useState(null);
	const [newStreamPic, setNewStreamPic] = useState();

	const [isPlaybackActive, setPlaybackActive] = useState(false);
	const [playbackVideo, setPlaybackVideo] = useState(null);
	const [playbackVideoType, setPlaybackVideoType] = useState(null);
	const [playbackVideoQuestion, setPlaybackVideoQuestion] = useState(null);
	const [playbackVideoAnswer, setPlaybackVideoAnswer] = useState(null);
	const [playbackVideoPrivacy, setPlaybackVideoPrivacy] = useState(null);

	const [showVideoDeletePopup, setShowVideoDeletePopup] = useState(false);
	const [questionBeingDeleted, setQuestionBeingDeleted] = useState(null);
	const [currentUserFullname, setCurrentUserFullname] = useState(null);
	const [currentUserLanguage, setCurrentUserLanguage] = useState(null);
	const [currentUserEmail, setCurrentUserEmail] = useState(null);

	const [isEditSuggestionModalActive, setIsEditSuggestionModalActive] =
		useState(false);
	const [currentlyEditingSuggestion, setCurrentlyEditingSuggestion] =
		useState(undefined);
	const [waitingServerResponse, setWaitingServerReponse] = useState(false);
	const [suggestionNewValue, setSuggestionNewValue] = useState("");

	const [videosCount, setVideosCount] = useState(0);
	const [videosTotalDuration, setVideosTotalDuration] = useState(null);

	const [searchTerm, setSearchTerm] = useState("");

	const [numberOfVideosDisplayed, setNumberOfVideosDisplayed] = useState(10);

	const [loadingVideos, setLoadingVideos] = useState(false);

	React.useEffect(() => {
		if (!isLoggedIn()) {
			history.push("/login");
			return;
		}

		setName(getUser().first_name);
		setLanguage(getUser().language);
		setTOIAid(getUser().id);

		fetchStreamList().then(data => {
			fetchRecordedQuestions(data[0].id_stream);
			let dataCpy = data[0];
			dataCpy.id = dataCpy.id_stream;
			setCurrentStream(dataCpy);
		});

		fetchUserStats();
		fetchOnBoardingQuestions();
		fetchSuggestedQuestions();

		// Tracker
		new Tracker().startTracking(history.location.state);

		getUserData();
	}, []);

	React.useEffect(() => {
		fetchOnBoardingQuestions();
	}, [i18n.language]);

	function fetchStreamList() {
		return new Promise(resolve => {
			axios.get(API_URLS.GET_USER_STREAMS(getUser().id)).then(res => {
				setStreamList(res.data);
				resolve(res.data);
			});
		});
	}

	function fetchOnBoardingQuestions(cb_success = null, cb_fail = null) {
		const options = {
			method: "GET",
			url: API_URLS.ONBOARDING_QUESTIONS_LIST(),
			params: {
				language: t("language") ?? "en-US",
			},
		};

		axios
			.request(options)
			.then(function (response) {
				if (response.status === 200) {
					let data = response.data;
					data = data
						.filter(item => item.pending)
						.map(item => {
							item.type = item.suggested_type;
							delete item.suggested_type;
							return item;
						});
					setPendingOnBoardingQs(data);

					if (cb_success) cb_success();
				} else {
					NotificationManager.error("Something went wrong");

					if (cb_fail) cb_fail();
				}
			})
			.catch(function (error) {
				console.error(error);

				if (cb_fail) cb_fail();
			});
	}

	function fetchSuggestedQuestions(cb_success = null, cb_fail = null) {
		const options = {
			method: "GET",
			url: API_URLS.QUESTION_SUGGESTIONS(),
		};

		axios
			.request(options)
			.then(function (response) {
				if (response.status === 200) {
					let data = response.data
						.filter(item => item.isPending)
						.map(item => {
							item.id = item.id_question;
							delete item.id_question;
							return item;
						});
					setSuggestedQsList(data);
					if (cb_success) cb_success();
				} else {
					console.log(response);
					if (cb_fail) cb_fail();
				}
			})
			.catch(function (error) {
				console.error(error);
				if (cb_fail) cb_fail();
			});
	}

	function fetchRecordedQuestions(
		streamID,
		cb_success = null,
		cb_fail = null,
	) {
		const options = {
			method: "GET",
			url: API_URLS.ANSWERED_QUESTIONS(),
			params: { stream_id: streamID },
		};

		axios
			.request(options)
			.then(function (response) {
				if (response.status === 200) {
					setRecordedQsList(response.data);
					if (cb_success) cb_success();
				} else {
					if (cb_fail) cb_fail();
				}
			})
			.catch(function (error) {
				console.error(error);
				if (cb_fail) cb_fail();
			});
	}

	function fetchUserStats() {
		const options = {
			method: "GET",
			url: API_URLS.USER_STATS(),
		};

		axios
			.request(options)
			.then(function (response) {
				const data = response.data.data;

				setVideosCount(data.totalVideosCount);
				setVideosTotalDuration(data.totalVideoDuration);
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	const handleEditRecordedVideoClick = recorded_q_obj => {
		history.push({
			pathname: "/recorder",
			state: {
				toiaName,
				toiaLanguage,
				toiaID,
				isEditing: true,
				video_id: recorded_q_obj.id_video,
				type: recorded_q_obj.type,
			},
		});
	};

	const reachedScrollBottom = () => {
		setLoadingVideos(true);
		setNumberOfVideosDisplayed(numberOfVideosDisplayed + 8);
		setLoadingVideos(false);
	};

	const scrollRef = useBottomScrollListener(reachedScrollBottom);

	/*functions in charge of opening and closing the various pop up menus*/
	function exampleReducer(state, action) {
		//for warning window when you delete
		switch (action.type) {
			case "close":
				return { open: false };
			case "open":
				return { open: true };
		}
	}

	const [state, dispatch] = React.useReducer(exampleReducer, { open: false });
	const { open } = state;

	function openModal(e) {
		dispatch({ type: "open" });
		e.preventDefault();
	}

	function exampleReducer2(state2, action) {
		// for account settings window
		switch (action.type) {
			case "close":
				return { open2: false };
			case "open":
				return { open2: true };
		}
	}

	const [state2, dispatch2] = React.useReducer(exampleReducer2, {
		open2: false,
	});
	const { open2 } = state2;

	function openModal2(e) {
		dispatch2({ type: "open" });
		e.preventDefault();
	}

	function exampleReducer3(state3, action) {
		// for stream settings window
		switch (action.type) {
			case "close":
				return { open3: false };
			case "open":
				return { open3: true };
		}
	}

	const [state3, dispatch3] = React.useReducer(exampleReducer3, {
		open3: false,
	});
	const { open3 } = state3;

	function openModal3(e) {
		dispatch3({ type: "open" });
		e.preventDefault();
	}

	function exampleReducer4(state4, action) {
		// window for adding a stream
		switch (action.type) {
			case "close":
				return { open4: false };
			case "open":
				return { open4: true };
		}
	}

	const [state4, dispatch4] = React.useReducer(exampleReducer4, {
		open4: false,
	});
	const { open4 } = state4;

	function openModal4(e) {
		dispatch4({ type: "open" });
		e.preventDefault();
	}

	function openPlayback(e, card) {
		e.stopPropagation();
		axios.get(API_URLS.VIDEO_INFO(card.id_video)).then(res => {
			const videoURL = res.data.videoURL;
			const videoAnswer = res.data.answer;
			const videoPrivacy = res.data.private ? "Private" : "Public";
			setPlaybackVideo(videoURL);
			setPlaybackVideoType(
				card.type.charAt(0).toUpperCase() + card.type.slice(1),
			);
			setPlaybackVideoQuestion(card.question);
			setPlaybackVideoAnswer(videoAnswer);
			setPlaybackVideoPrivacy(videoPrivacy);
			setPlaybackActive(true);
		});
	}

	function openSuggestion(e, card) {
		e.stopPropagation();
		history.push({
			pathname: "/recorder?type=" + card.type,
			state: {
				toiaName,
				toiaLanguage,
				toiaID,
				suggestedQuestion: card.question,
				id_question: card.id,
				question_obj: card,
			},
		});
	}

	// querying the database for user data
	function getUserData() {
		axios
			.get(API_URLS.USER_INFO())
			.then(res => {
				const user = res.data.data;
				setCurrentUserFullname(`${user.first_name} ${user.last_name}`);
				setCurrentUserLanguage(user.language);
				setCurrentUserEmail(user.email);
			})
			.catch(err => {
				console.log(err);
			});
	}

	const [anchorEl, setAnchorEl] = useState(null); //for list of streams drop down menu when you click on move icon
	const [selectedIndex, setSelectedIndex] = useState(null);

	const handleMenuClick = event => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = (event, index) => {
		setSelectedIndex(index);
		openModal(event);
		setAnchorEl(null);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDeleteVideo = () => {
		NotificationManager.info("Deleting video...");
		const options = {
			method: "DELETE",
			url: API_URLS.REMOVE_VIDEO(),
			data: {
				question_id: questionBeingDeleted.id,
				video_id: questionBeingDeleted.id_video,
			},
		};

		axios
			.request(options)
			.then(function (response) {
				setShowVideoDeletePopup(false);
				NotificationManager.info("Deleting video...");
				if (response.status === 200) {
					if (currentStream) {
						fetchRecordedQuestions(currentStream.id);
					} else {
						fetchRecordedQuestions(streamList[0].id_stream);
					}
					fetchUserStats();
					fetchOnBoardingQuestions();
					fetchStreamList();
					NotificationManager.info("Video removed!");
				} else {
					NotificationManager.error("Couldn't delete video!");
					console.error(response);
				}
			})
			.catch(function (error) {
				NotificationManager.error("Couldn't delete video!");
				console.error(error);
			});
	};

	const handleDeleteSuggestion = card => {
		const options = {
			method: "PATCH",
			url: API_URLS.DISCARD_SUGGESTION(card.id),
			data: {
				isPending: false,
			},
		};

		axios
			.request(options)
			.then(function (response) {
				if (response.status === 200) {
					fetchSuggestedQuestions(() => {
						NotificationManager.info("Suggestion Removed!");
					});
				} else {
					console.log(response);
				}
			})
			.catch(function (error) {
				NotificationManager.error("Couldn't delete suggestion!");
				console.error(error);
			});
	};

	const onEditSuggestion = () => {
		setWaitingServerReponse(true);

		const options = {
			method: "PATCH",
			url: API_URLS.EDIT_SUGGESTION(currentlyEditingSuggestion.id),
			data: {
				new_value: suggestionNewValue,
			},
		};

		axios
			.request(options)
			.then(function (response) {
				if (response.status === 200) {
					fetchSuggestedQuestions(
						() => {
							setWaitingServerReponse(false);
							setIsEditSuggestionModalActive(false);
							setCurrentlyEditingSuggestion(null);
							setSuggestionNewValue("");

							NotificationManager.info("Suggestion updated!");
						},
						() => {
							setWaitingServerReponse(false);
							setIsEditSuggestionModalActive(false);
							setCurrentlyEditingSuggestion(null);
							setSuggestionNewValue("");

							NotificationManager.error(
								"Unable to retrieve suggestions",
							);
						},
					);
				} else {
					console.error(response);
				}
			})
			.catch(function (error) {
				console.error(error);
			});
	};

	const getFilteredSuggestionsList = () => {
		const term = searchTerm.toLowerCase();
		if (term.trim().length > 0) {
			return suggestedQsList.filter(
				q => q.question.toLowerCase().search(term) > -1,
			);
		}
		return suggestedQsList;
	};

	const getFilteredRecordedQsList = () => {
		const term = searchTerm.toLowerCase();
		if (term.trim().length > 0) {
			return recordedQsList.filter(
				q => q.question.toLowerCase().search(term) > -1,
			);
		}
		return recordedQsList;
	};

	var settingData = [{ name: "", email: "", password: "", language: "" }];

	var settingData = [
		{
			name: `${currentUserFullname}`,
			email: `${currentUserEmail}`,
			password: "",
			language: `${currentUserLanguage}`,
		},
	];

	const [displayItem, setDisplayItem] = useState("none");

	const EditSuggestionModal = () => {
		return (
			<Modal
				onClose={() => {
					if (!waitingServerResponse) {
						setIsEditSuggestionModalActive(false);
					}
				}}
				open={isEditSuggestionModalActive}>
				<Modal.Header>Edit Suggestion</Modal.Header>
				<Modal.Content>
					<Input
						fluid
						placeholder={t("type_request")}
						disabled={waitingServerResponse}
						onChange={e => {
							setSuggestionNewValue(e.target.value);
						}}
						value={suggestionNewValue}
					/>
				</Modal.Content>
				<Modal.Actions>
					<Button
						color="black"
						disabled={waitingServerResponse}
						onClick={() => setIsEditSuggestionModalActive(false)}>
						Cancel
					</Button>
					<Button
						disabled={waitingServerResponse}
						loading={waitingServerResponse}
						content={t("update")}
						labelPosition="right"
						icon="checkmark"
						onClick={onEditSuggestion}
						positive
					/>
				</Modal.Actions>
			</Modal>
		);
	};

	const renderStream = (card, index) => {
		//cards for streams

		let streamSetting;
		if (card.name !== "All") {
			streamSetting = (
				<div className="garden-settings-buttons">
					<button
						onClick={changeStreamSettings}
						className="stream-settings">
						<i className="fa fa-cog " />
					</button>
					<button
						onClick={() => {
							toggleEye(card);
						}}
						className="stream-private">
						<i className={privacy_eye} aria-hidden="true" />
					</button>
				</div>
			);
		} else {
			streamSetting = (
				<div className="garden-settings-buttons">
					<button
						onClick={() => {
							toggleEye(card);
						}}
						className="stream-private">
						<i className={privacy_eye} aria-hidden="true" />
					</button>
				</div>
			);
		}

		return (
			<div
				className="garden-carousel-card"
				id={card.id_stream}
				key={index}>
				<img
					className="stream-image-sizing"
					src={card.pic}
					width="170" //stream thumbnail
					alt="stream thumbnail"
				/>
				{streamSetting}

				<div onClick={album_page}>
					<h1
						className="t1 garden-font-class-2" //name of user
					>
						{toiaName}
					</h1>
					<p
						className="t2 garden-font-class-2 margin-bottom-2px" //individual stream name
					>
						{card.name}
					</p>

					<div className="ui gray label medium">
						<i aria-hidden="true" className="video icon" />
						{t("total_videos_in_stream")}
						<div className="detail">{card.videos_count}</div>
					</div>
				</div>
				<br />
				<div
					className="garden-carousel-menu" //stats that appear under stream
				>
					<p style={{ marginRight: 30 }}>
						{card.ppl}&nbsp;
						<i className="fa fa-users" />
					</p>
					<p style={{ marginRight: 14 }}>
						{card.heart}
						<i className="fa fa-heart" />
					</p>
					<p style={{ marginLeft: 15 }}>
						{card.thumbs}&nbsp;
						<i className="fa fa-thumbs-up" />
					</p>
				</div>
			</div>
		);
	};

	let videoPlayback = (
		<video id="playbackVideo" width="496" height="324" autoPlay controls>
			<source src={playbackVideo} type="video/mp4" />
		</video>
	);

	function handleSelectCurrentStream(currentItemObject, currentPageIndex) {
		setCurrentStream(currentItemObject.item);
		fetchRecordedQuestions(currentItemObject.item.id);
	}

	/*navigations to pages from buttons*/
	function add() {
		history.push({
			pathname: "/recorder",
			state: {
				toiaName,
				toiaLanguage,
				toiaID,
			},
		});
	}

	function album_page() {
		history.push({
			pathname: "/stream",
			state: {
				toiaName,
				toiaLanguage,
				toiaID,
			},
		});
	}

	function groupSelect() {
		//function called when the multiple videos are selected
		if (selectedIndex == null) {
			//test if function call is for delete
			dispatch({ type: "close" });
			//return cardSelected as the videos to be group deleted (Wahib)
		} else {
			dispatch({ type: "close" });
			//return streams[selectedIndex].streamName and cardSelected as videos to move to slected album (Wahib)
			setSelectedIndex(null);
		}
	}

	function save() {
		//this function saves all changes the user makes to the account settings
		dispatch({ type: "close" });
	}

	function setImg(e) {
		setNewStreamPic(e.target.files[0]);
		e.preventDefault();
	}

	function saveNewStream(e) {
		//this function saves all changes the user makes to the account settings

		let form = new FormData();
		form.append("stream_pic", newStreamPic);
		form.append("name", newStreamName);
		form.append("private", newStreamPrivacy === "public" ? true : false);

		axios.post(API_URLS.CREATE_NEW_STREAM(), form).then(res => {
			setStreamList(res.data);
			dispatch4({ type: "close" });

			NotificationManager.success("Stream Created!");
		});
		e.preventDefault();
	}

	const inlineStyle = {
		modal: {
			height: "100px",
			width: "600px",
		},
	};

	const inlineStyleSetting = {
		modal: {
			height: "70vh",
			width: "50vw",
		},
	};

	// let privacy_eye = "fa fa-eye"
	const [privacy_eye, setPrivacyEye] = useState("fa fa-eye");
	const [stream_privacy, setStreamPrivacy] = useState("Public");

	function toggleEye(card) {
		console.log(card);
		if (privacy_eye === "fa fa-eye") {
			setPrivacyEye("fa fa-eye-slash");
			setStreamPrivacy("Private");
			console.log("work toggle eye test");
		} else {
			setPrivacyEye("fa fa-eye");
			setStreamPrivacy("Public");
			console.log("second case toggle eye test");
		}
	}

	function changeStreamSettings(e) {
		openModal3(e);
	}

	return (
		<div className="garden-page">
			<NavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={true}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={false}
			/>

			<Modal //This is the warning pop menu, that shows whenever you delete or move videos
				size="large"
				closeIcon={true}
				style={inlineStyle.modal}
				open={open}
				onClose={() => dispatch({ type: "close" })}>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						{t("confirm")}
					</h1>
					<p className="login_blurb login-montserrat-black">
						{t("notify_as_irreversible")}
					</p>
				</Modal.Header>
				<Modal.Actions>
					<Button color="green" inverted onClick={groupSelect}>
						<i className="fa fa-check" />
					</Button>
				</Modal.Actions>
			</Modal>
			<Modal //This is the settings pop menu, that shows whenever you delete or move videos
				size="large"
				closeIcon={true}
				style={inlineStyleSetting.modal}
				open={open2}
				onClose={() => dispatch2({ type: "close" })}>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						Account Settings
					</h1>
					<p className="login_blurb login-montserrat-black">
						{t("edit_account")}
					</p>
				</Modal.Header>
				<Modal.Content>
					<div
						className="garden-settings-name garden-font-class-2" //the name input field
					>
						{t("name_input")}
					</div>
					<input
						className="garden-settings-name_box garden-font-class-2"
						defaultValue={settingData[0].name}
						type={"text"}
						onChange={e => (settingData[0].name = e.target.value)}
					/>
					<div
						className="garden-settings-email garden-font-class-2" //the email input field
					>
						{t("email_input")}
					</div>
					<input
						className="garden-settings-email_box garden-font-class-2"
						defaultValue={settingData[0].email}
						type={"email"}
						onChange={e => (settingData[0].email = e.target.value)}
					/>
					<div
						className="garden-settings-pass garden-font-class-2" //the password input field
					>
						t("password_input")
					</div>
					<input
						className="garden-settings-pass_box garden-font-class-2"
						defaultValue={settingData[0].password}
						type={"password"}
						onChange={e =>
							(settingData[0].password = e.target.value)
						}
					/>
					<div
						className="garden-settings-lang garden-font-class-2" //the language input field
					>
						{t("language_input")}
					</div>
					<select
						className="garden-settings-lang_box garden-font-class-2"
						onChange={e =>
							(settingData[0].language = e.target.value)
						} /*required={true}*/
					>
						<option value="" disabled selected hidden>
							{settingData[0].language}
						</option>
						<option value="AF">Afrikaans</option>
						<option value="SQ">Albanian</option>
						<option value="AR">Arabic</option>
						<option value="HY">Armenian</option>
						<option value="EU">Basque</option>
						<option value="BN">Bengali</option>
						<option value="BG">Bulgarian</option>
						<option value="CA">Catalan</option>
						<option value="KM">Cambodian</option>
						<option value="ZH">Chinese (Mandarin)</option>
						<option value="HR">Croatian</option>
						<option value="CS">Czech</option>
						<option value="DA">Danish</option>
						<option value="NL">Dutch</option>
						<option value="EN">English</option>
						<option value="ET">Estonian</option>
						<option value="FJ">Fiji</option>
						<option value="FI">Finnish</option>
						<option value="FR">French</option>
						<option value="KA">Georgian</option>
						<option value="DE">German</option>
						<option value="EL">Greek</option>
						<option value="GU">Gujarati</option>
						<option value="HE">Hebrew</option>
						<option value="HI">Hindi</option>
						<option value="HU">Hungarian</option>
						<option value="IS">Icelandic</option>
						<option value="ID">Indonesian</option>
						<option value="GA">Irish</option>
						<option value="IT">Italian</option>
						<option value="JA">Japanese</option>
						<option value="JW">Javanese</option>
						<option value="KO">Korean</option>
						<option value="LA">Latin</option>
						<option value="LV">Latvian</option>
						<option value="LT">Lithuanian</option>
						<option value="MK">Macedonian</option>
						<option value="MS">Malay</option>
						<option value="ML">Malayalam</option>
						<option value="MT">Maltese</option>
						<option value="MI">Maori</option>
						<option value="MR">Marathi</option>
						<option value="MN">Mongolian</option>
						<option value="NE">Nepali</option>
						<option value="NO">Norwegian</option>
						<option value="FA">Persian</option>
						<option value="PL">Polish</option>
						<option value="PT">Portuguese</option>
						<option value="PA">Punjabi</option>
						<option value="QU">Quechua</option>
						<option value="RO">Romanian</option>
						<option value="RU">Russian</option>
						<option value="SM">Samoan</option>
						<option value="SR">Serbian</option>
						<option value="SK">Slovak</option>
						<option value="SL">Slovenian</option>
						<option value="ES">Spanish</option>
						<option value="SW">Swahili</option>
						<option value="SV">Swedish</option>
						<option value="TA">Tamil</option>
						<option value="TT">Tatar</option>
						<option value="TE">Telugu</option>
						<option value="TH">Thai</option>
						<option value="BO">Tibetan</option>
						<option value="TO">Tonga</option>
						<option value="TR">Turkish</option>
						<option value="UK">Ukrainian</option>
						<option value="UR">Urdu</option>
						<option value="UZ">Uzbek</option>
						<option value="VI">Vietnamese</option>
						<option value="CY">Welsh</option>
						<option value="XH">Xhosa</option>
					</select>
					<div
						className="garden-settings-delete" //delete button, function TBD
					>
						<h1 className="garden-font-class-2 garden-settings-text">
							{t("delete")}
						</h1>
					</div>
					<div
						onClick={save}
						className="garden-settings-save" //saves changes made inaccount settings, function TBD
					>
						<h1 className="garden-font-class-2 garden-settings-text">
							{t("save")}
						</h1>
					</div>
				</Modal.Content>
			</Modal>

			<Modal //This is the stream settings pop menu
				size="large"
				closeIcon={true}
				style={inlineStyleSetting.modal}
				open={open3}
				onClose={() => dispatch3({ type: "close" })}>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						{t("edit_stream")}
					</h1>
					<p className="login_blurb login-montserrat-black">
						{t("edit_stream_text")}
					</p>
				</Modal.Header>
				<Modal.Content>
					<div
						className="stream-settings-name garden-font-class-2" //the name input field
					>
						{t("name_input")}
					</div>
					<input
						className="stream-settings-name_box garden-font-class-2"
						placeholder="Enter a new stream name"
						type={"text"}
						onChange={e => setNewStreamName(e.target.value)}
						required={true}
					/>
					<div
						className="stream-settings-email garden-font-class-2" //the email input field
					>
						{t("privacy_input")}
					</div>
					<select
						className="stream-settings-email_box garden-font-class-2"
						onChange={e => setNewStreamPrivacy(e.target.value)}
						required={true}>
						<option value="" disabled selected hidden>
							{stream_privacy}
						</option>
						<option value="public">{t("public")}</option>
						<option value="private">{t("private")}</option>
					</select>

					<div
						className="stream-settings-lang garden-font-class-2" //the language input field
					>
						{t("bio_input")}
					</div>

					<textarea
						className="stream-settings-lang_box garden-font-class-2"
						placeholder="Enter what your new stream will be about"
						type={"text"}
						onChange={e => setNewStreamBio(e.target.value)}
						rows="4"
						cols="50"
						required={true}
					/>
					<div
						className="stream-photo-upload garden-font-class-2" //delete button, function TBD
					>
						<form>
							<label htmlFor="img">{t("select_img")}</label>
							<input
								className="stream-photo-upload-choose garden-font-class-2"
								type="file"
								id="img"
								name="img"
								accept="image/*"
								onChange={setImg}
							/>
							<input
								className="stream-settings-save garden-font-class-2 stream-settings-text"
								onClick={saveNewStream}
								type="submit"
							/>
						</form>
					</div>
				</Modal.Content>
			</Modal>
			<Modal //This is the stream settings pop menu
				size="large"
				closeIcon={true}
				style={inlineStyleSetting.modal}
				open={open4}
				onClose={() => dispatch4({ type: "close" })}>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						{t("add_stream")}
					</h1>
					<p className="login_blurb login-montserrat-black">
						{t("add_stream_text")}
					</p>
				</Modal.Header>
				<Modal.Content>
					<div
						className="stream-settings-name garden-font-class-2" //the name input field
					>
						{t("name_input")}
					</div>
					<input
						className="stream-settings-name_box garden-font-class-2"
						placeholder="Enter a new stream name"
						type={"text"}
						onChange={e => setNewStreamName(e.target.value)}
						required={true}
					/>
					<div
						className="stream-settings-email garden-font-class-2" //the email input field
					>
						{t("privacy_input")}
					</div>
					<select
						className="stream-settings-email_box garden-font-class-2"
						onChange={e => setNewStreamPrivacy(e.target.value)}
						required={true}>
						<option value="" disabled selected hidden>
							Public
						</option>
						<option value="public">{t("public")}</option>
						<option value="private">{t("private")}</option>
					</select>

					<div
						className="stream-settings-lang garden-font-class-2" //the language input field
					>
						{t("bio_input")}
					</div>

					<textarea
						className="stream-settings-lang_box garden-font-class-2"
						placeholder="Enter what your new stream will be about"
						type={"text"}
						onChange={e => setNewStreamBio(e.target.value)}
						rows="4"
						cols="50"
						required={true}
					/>
					<div
						className="stream-photo-upload garden-font-class-2" //delete button, function TBD
					>
						<form>
							<label htmlFor="img">{t("select_img")}</label>
							<input
								className="stream-photo-upload-choose garden-font-class-2"
								type="file"
								id="img"
								name="img"
								accept="image/*"
								onChange={setImg}
							/>
							<input
								className="stream-settings-save garden-font-class-2 stream-settings-text"
								onClick={saveNewStream}
								type="submit"
							/>
						</form>
					</div>
				</Modal.Content>
			</Modal>
			<Modal //this is the new pop up menu
				size="large"
				style={{
					position: "absolute",
					height: "80%",
					width: "70%",
					top: "2%",
					alignContent: "center",
				}}
				open={isPlaybackActive}
				onClose={() => {
					setPlaybackActive(false);
				}}>
				<Modal.Header className="modal-header">
					<div>{t("video_entry")}</div>
				</Modal.Header>
				<Modal.Content>
					<div id="typeOfVideo">Video Type: {playbackVideoType}</div>
					<div id="questionOfVideo">
						Question being answered: "{playbackVideoQuestion}"
					</div>
					<div id="privacyOfVideo">
						Privacy Settings: {playbackVideoPrivacy}
					</div>
					<div id="divider" />
					<div className={"ui row centered grid"}>
						{videoPlayback}
					</div>
					<div id="answerCorrection">The answer provided:</div>
					<input
						className="modal-ans font-class-1"
						value={playbackVideoAnswer}
						type={"text"}
						onChange={() => {}}
					/>
				</Modal.Content>
				<Modal.Actions>
					<Button
						color="green"
						onClick={() => {
							setPlaybackActive(false);
						}}>
						<i className="fa fa-check" />
					</Button>
				</Modal.Actions>
			</Modal>

			<div className="section3">
				<h1
					className="garden-title garden-font-class-1 " //welcome message
				>
					{t("greet_user", { toiaName: toiaName })}
				</h1>

				<div className="stats-container">
					<div className="stats-wrapper">
						<div className="stats-number">{videosCount}</div>
						<div className="stats-label">{t("total_videos")}</div>
					</div>

					<div className="stats-wrapper">
						<div className="stats-number">
							{videosTotalDuration
								? (videosTotalDuration / 60).toFixed(1)
								: 0}
							Min
						</div>
						<div className="stats-label">
							{t("total_videos_length")}
						</div>
					</div>
				</div>
				<button
					onClick={event => {
						openModal2(event);
					}}
					className="garden-settings">
					<i className="fa fa-cog" />
				</button>
			</div>
			<div className="section1">
				<h1 className="stream-heading garden-font-class-3 ">
					{t("my_toia_streams")}
				</h1>

				<Carousel
					itemsToShow={1}
					showArrows={false}
					onChange={handleSelectCurrentStream}>
					{streamList.map(renderStream)}
				</Carousel>

				<div
					onClick={event => {
						openModal4(event);
					}}>
					<img
						className="garden-stream"
						src={addButton} // add stream button
						alt={""}
					/>
				</div>
				<h1 className="stream-add-text garden-font-class-3">
					Add Stream
				</h1>
			</div>

			<div className="section2">
				{/*<input className="garden-search garden-search-text" type="text" placeholder="&#xF002;" onChange={(e) => {setSearchTerm(e.target.value)}} value={searchTerm}/>*/}

				<div className="ui fluid icon input search-box-mytoia">
					<input
						type="text"
						placeholder="Search..."
						onChange={e => {
							setSearchTerm(e.target.value);
						}}
						value={searchTerm}
					/>
					<i aria-hidden="true" className="search icon" />
				</div>

				<div className="garden-grid" ref={scrollRef}>
					<div className="cards-wrapper ui">
						<div className="ui cards">
							<RecordAVideoCard
								onClick={add}
								isDisabled={pendingOnBoardingQs.length !== 0}
							/>

							{pendingOnBoardingQs.map((q, index) => {
								return (
									<OnBoardingQCard
										data={q}
										onClick={e => {
											openSuggestion(e, q);
										}}
										key={index}
									/>
								);
							})}

							{getFilteredSuggestionsList()
								.slice(0, 5)
								.map((q, index) => {
									return (
										<SuggestedQCard
											data={q}
											onClick={e => {
												openSuggestion(e, q);
											}}
											isDisabled={
												pendingOnBoardingQs.length !== 0
											}
											onEdit={() => {
												setSuggestionNewValue(
													q.question,
												);
												setCurrentlyEditingSuggestion(
													q,
												);
												setIsEditSuggestionModalActive(
													true,
												);
											}}
											onDelete={() => {
												handleDeleteSuggestion(q);
											}}
											key={index}
										/>
									);
								})}

							{getFilteredRecordedQsList()
								.slice(0, numberOfVideosDisplayed)
								.map((q, index) => {
									return (
										<RecordedQCard
											data={q}
											onClick={e => {
												openPlayback(e, q);
											}}
											key={index}
											onEdit={() => {
												handleEditRecordedVideoClick(q);
											}}
											onDelete={() => {
												setQuestionBeingDeleted(q);
												setShowVideoDeletePopup(true);
											}}
										/>
									);
								})}
						</div>
					</div>
					{loadingVideos && (
						<div className="ui active centered inline loader" />
					)}
				</div>

				{EditSuggestionModal()}

				<Confirm
					open={showVideoDeletePopup}
					header={"Confirm Deletion"}
					content={t("notify_as_irreversible")}
					confirmButton={"Delete"}
					onCancel={() => {
						setShowVideoDeletePopup(false);
					}}
					onConfirm={handleDeleteVideo}
				/>

				<div
					className="garden-hidden"
					style={{ display: displayItem }} // hidden menu that appears when video is selected
				>
					<div onClick={openModal}>
						<img className="garden-trash" src={trashIcon} />
					</div>
					<div>
						<IconButton // icon buttonm menu I got from material-ui, its a react framework that I used a lot to create things
							aria-label="more"
							aria-controls="long-menu"
							aria-haspopup="true"
							onClick={handleMenuClick}>
							<img className="garden-move_icon" src={moveIcon} />
						</IconButton>
						<Menu
							id="simple-menu"
							anchorEl={anchorEl}
							keepMounted
							open={Boolean(anchorEl)}
							onClose={handleClose}>
							{streamList.map(
								(
									option,
									index, // this is the menu, its a list of the stream names I took form the streams variable
								) => (
									<MenuItem
										selected={index === selectedIndex}
										onClick={event =>
											handleMenuClose(event, index)
										}
										key={index}>
										{option.streamName}
									</MenuItem>
								),
							)}
						</Menu>
					</div>
				</div>
			</div>
			<NotificationContainer />
		</div>
	);
}

export default AvatarGardenPage;
