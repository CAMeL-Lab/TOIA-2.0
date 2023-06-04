//Landing page for Elephant in the room 
import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import sampleVideo from "../icons/sample-video.svg";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import { Modal } from "semantic-ui-react";
import axios from "axios";
import Tracker from "../utils/tracker";
import elephant from "../images/elephant.png";
import './ShhhPage.css';

//Description for each card
const BirthText = "Ask moms about their childbirth experiences that you're too afraid to ask, from labor horror stories to body transformations.";
const DeathText = "Join in a heartfelt conversation about death with elderly individuals and people with chronic conditions. Are you scared of death?";
const SexText = "Don't be shy! Join us to have open, juicy, and playful conversations about sex that you are curious but don't dare to ask in real-life. We welcome your curiosity!";


function ShhhPage() {

	const [open2, dispatch2] = useState(false); // this is to open the view pop up

	function openModal2(e) {
		dispatch2(true);
		e.preventDefault();
	}

	const [open3, dispatch3] = useState(false); // this is to open the view pop up

	function openModal3(e) {
		dispatch3(true);
		e.preventDefault();
	}

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [isLoggedIn, setLoginState] = useState(false);
	const [allData, setAllData] = useState([]);
	const [searchData, setSearchData] = useState([]);

	const [interactionLanguage, setInteractionLanguage] = useState(null);

	useEffect(() => {
		if (history.location.state != undefined) {
			setLoginState(true);
			setName(history.location.state.toiaName);
			setLanguage(history.location.state.toiaLanguage);
			setTOIAid(history.location.state.toiaID);
		}

		console.log("Trying my best here!", history.location.state?.toiaID);

		axios.get(`/api/getAllStreams`).then(res => {
			let user_id = history.location.state?.toiaID;
			axios
				.get(`/api/permission/streams?user_id=${user_id}`)
				.then(permission_res => {
					let filtered_streams = res.data.filter(item => {
						return permission_res.data.includes(item.id_stream);
					});
					setAllData(filtered_streams);
					setSearchData(filtered_streams);
				});
		});

		// Track
		new Tracker().startTracking(history.location.state);
	}, []);

	function goToPlayer(element) {
		if (isLoggedIn) {
			history.push({
				pathname: "/shhhplayer",
				state: {
					toiaName,
					toiaLanguage,
					toiaID,
					toiaToTalk: element.id,
					toiaFirstNameToTalk: element.first_name,
					toiaLastNameToTalk: element.last_name,
					streamToTalk: element.id_stream,
					streamNameToTalk: element.name + " stream",
				},
			});
		} else {
			history.push({
				pathname: "/shhhplayer",
				state: {
					toiaToTalk: element.id,
					toiaFirstNameToTalk: element.first_name,
					toiaLastNameToTalk: element.last_name,
					streamToTalk: element.id_stream,
					streamNameToTalk: element.name + " stream",
				},
			});
		}
	}
	//Display stream cards under the name of "Birth, Sex and Death"
	const renderStream = (card, index) => {
		console.log(card);
		console.log('cardname' + card.name);
		const orderedCards = ["Birth", "Sex", "Death"];
		if (orderedCards.includes(card.name)) {
			//cards for streams
			return (
				<div className="shhh-carousel-card" id={card.id_stream}>
					<div className={card.name} onClick={() => {
						goToPlayer(card);
					}}>
						<img src={card.pic} className={`${card.name}-img`} alt="NONE" />
						<div className="headline-subhead">
							<div className="headline">
								<div className={"heading " + card.name + "-title" + " valign-text-middle"}>
									{card.name}
								</div>
							</div>
							<div className="description">
								{(() => {
									switch (card.name) {
										case "Birth":
											return BirthText;
										case "Death":
											return DeathText;
										case "Sex":
											return SexText;
										default:
											return "";
									}
								})()}
							</div>
						</div>
					</div>
				</div>
			);
		}
	};

	const inlineStyle = {
		modal: {
			height: '560px',
			width: '600px',
		}
	};

	const inlineStyleSetting = {
		modal: {
			height: '70vh',
			width: '50vw',
		}
	};

	return (
		<div className="shhh-page">
			<img src={elephant} className="elephant" alt="ELEPHANT IN THE ROOM" />
			<h1 class="title">Elephant In the Room</h1>
			<Modal //This is the stream settings pop menu
				size="large"
				closeIcon={true}
				style={inlineStyleSetting.modal}
				open={open3}
				onClose={() => dispatch3({ type: "close" })}
			>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						All Stream{" "}
					</h1>
					<p className="login_blurb login-montserrat-black">
						Here is the following information about your stream
					</p>
				</Modal.Header>
				<Modal.Content>
					<div
						className="library-stream-settings-name garden-font-class-2" //the name input field
					>
						Name:{" "}
					</div>
					<p className="library-stream-settings-name_box garden-font-class-2">
						Stream Name{" "}
					</p>

					<div className="library-stream-settings-ln garden-font-class-2">
						Language:{" "}
					</div>
					<p className="library-stream-settings-ln_box garden-font-class-2">
						Stream Language{" "}
					</p>

					<div
						className="library-stream-settings-bio garden-font-class-2" //the language input field
					>
						Bio:{" "}
					</div>

					<p className="library-stream-settings-bio_box garden-font-class-2">
						{" "}
						Stream Bio
					</p>
				</Modal.Content>
			</Modal>
			<div className="shhh-page-setup">
				<div className="shhh-grid" //videos
				>
					{searchData.map(renderStream)}
				</div>
			</div>
		</div>
	);
}

export default ShhhPage;
