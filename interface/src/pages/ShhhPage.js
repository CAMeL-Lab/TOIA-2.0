import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import sampleVideo from "../icons/sample-video.svg";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import { Modal } from "semantic-ui-react";
import axios from "axios";
import Tracker from "../utils/tracker";
import ShhhNavBar from './ShhhNavBar.js';
import childBirth from "../images/child_birth.png";
import sex from "../images/sex.png";
import death from "../images/death.png";


function ShhhPage() {

	/*functions in charge of opening and closing the various pop up menus*/

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
					// console.log(permission_res);
					// console.log(filtered_streams);
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
				pathname: "/player",
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
				pathname: "/player",
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

	const renderStream = (card, index) => {
		//cards for streams
		return (
			<div className="shhh-carousel-card" id={card.id_stream}>
				<div className="child-birth" onClick={() => {
					goToPlayer(card);
				}}>
					<img src={childBirth} className="child-birth-img" alt="child-birth" />
					<div className="headline-subhead">
						<div className="headline">
							<div className="heading child-birth-title valign-text-middle">
								Child Birth
							</div>
						</div>
						<div className="description">
							Engage in stories and discussions on the miraculous journey of bringing new life into the world.
						</div>
					</div>
				</div>

				<div className="sex" onClick={() => {
					goToPlayer(card);
				}}>
					<img src={sex} className="sex-img" alt="sex" />
					<div className="headline-subhead">
						<div className="headline">
							<div className="heading sex-title valign-text-middle">
								Sex
							</div>
						</div>
						<div className="description">
							Join to have open, honest, and playful conversations around sex.
						</div>
					</div>
				</div>

				<div className="death" onClick={() => {
					goToPlayer(card);
				}}>
					<img src={death} className="death-img" alt="death" />
					<div className="headline-subhead">
						<div className="headline">
							<div className="heading death-title valign-text-middle">
								Death
							</div>
						</div>
						<div className="description">
							Engage in stories and discussions on the miraculous journey of bringing new life into the world.
						</div>
					</div>
				</div>
			</div>
		);
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
			<ShhhNavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={isLoggedIn}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={true}
			/>
			<Modal //this is the view pop up menu
				size='large'
				style={inlineStyle.modal}
				open={open2}
				onClose={() => dispatch2(false)}
			>
				<Modal.Content>
					{/* <img className="library-view-img" src={allData[viewIndex].still}/> */}
					<div className="library-view-menu" //the stats that appear under the image
					>
						{/* <p style={{marginRight: 52}}>{allData[viewIndex].views}&nbsp;<i class="fa fa-users"></i></p>
                      <p style={{marginLeft: 26}}>{allData[viewIndex].likes}&nbsp;<i class="fa fa-thumbs-up"></i></p> */}
					</div>
					<div className="library-view-button">
						<img src={submitButton} />
					</div>
				</Modal.Content>
			</Modal>
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
