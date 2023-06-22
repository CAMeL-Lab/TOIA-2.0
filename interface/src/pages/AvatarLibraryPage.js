import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal } from "semantic-ui-react";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import Tracker from "../utils/tracker";

import NavBar from "./NavBar.js";

import { useTranslation } from "react-i18next";
import { getUser, isLoggedIn } from "../auth/auth";
import API_URLS from "../configs/api";

function AvatarLibraryPage() {
	const { t } = useTranslation();

	const [open2, dispatch2] = useState(false); // this is to open the view pop up
	const [open3, dispatch3] = useState(false); // this is to open the view pop up

	function openModal3(e) {
		dispatch3(true);
		e.preventDefault();
	}

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [loginState, setLoginState] = useState(false);
	const [allData, setAllData] = useState([]);
	const [searchData, setSearchData] = useState([]);

	const [interactionLanguage, setInteractionLanguage] = useState(null);

	useEffect(() => {
		if (isLoggedIn()) {
			setLoginState(true);
			setName(getUser().first_name);
			setLanguage(getUser().language);
			setTOIAid(getUser().id);
		} else {
			history.push("/");
		}

		const options = {
			method: "GET",
			url: API_URLS.STREAMS(),
		};

		axios.request(options).then(async res => {
			let streams = res.data.map(item => {
				item.id = item.toia_id;
				delete item.toia_id;
				return item;
			});

			for (const stream of streams) {
				const options = {
					method: "GET",
					url: API_URLS.OTHER_USER_INFO(stream.id),
				};
				let user_data = await axios.request(options);
				stream.first_name = user_data.data.data.first_name;
				stream.last_name = user_data.data.data.last_name;
			}

			setAllData(streams);
			setSearchData(streams);
		});

		// Track
		new Tracker().startTracking(history.location.state);
	}, []);

	function goToPlayer(element) {
		if (loginState) {
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
			<div className="garden-carousel-card" id={card.id_stream}>
				<img
					onClick={() => {
						goToPlayer(card);
					}}
					src={card.pic}
					className="library-stream-image-sizing" //stream thumbnail
					alt="stream thumbnail"
				/>
				<div>
					<h1
						className="t1 garden-font-class-2" //name of user
					>
						{card.first_name + " " + card.last_name}
					</h1>
					<p
						className="t2 garden-font-class-2" //individual stream name
					>
						<button
							onClick={openModal3}
							style={{
								backgroundColor: "transparent",
								border: "transparent",
								cursor: "pointer",
							}}>
							<i className="fa fa-info-circle"></i>
						</button>
						{" " + card.name + " stream"}
					</p>
				</div>
				<br></br>
				<div
					className="garden-carousel-menu" //stats that appear under stream
				></div>
			</div>
		);
	};

	const searchStreams = searchval => {
		//search function
		if (!searchval) {
			setSearchData(allData); //if search is empty show all avatars
			return;
		}

		const filteredData = allData.filter((item, index) => {
			let searchTerms = searchval.split(" ");
			for (let term of searchTerms) {
				if (
					(item.first_name + item.last_name + item.name)
						.toLowerCase()
						.includes(term.toLowerCase())
				)
					return true;
			}
			return false;
		});

		setSearchData(filteredData);
	};

	const inlineStyle = {
		modal: {
			height: "560px",
			width: "600px",
		},
	};

	const inlineStyleSetting = {
		modal: {
			height: "70vh",
			width: "50vw",
		},
	};

	return (
		<div className="library-page">
			<NavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={loginState}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={true}
			/>
			<Modal //this is the view pop up menu
				size="large"
				style={inlineStyle.modal}
				open={open2}
				onClose={() => dispatch2(false)}>
				<Modal.Content>
					<div
						className="library-view-menu" //the stats that appear under the image
					></div>
					<select
						className="library-lang-box"
						onChange={e => setInteractionLanguage(e.target.value)}>
						<option value="" disabled selected hidden>
							What language would you like to speak in..
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
						<option value="SV">Swedish </option>
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
					<div className="library-view-button">
						<img src={submitButton} alt="submit" />
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

			<div className="library-page-setup">
				<h1 className={`library-heading ${t("alignment")}`}>
					{t("page_title")}
				</h1>
				<input
					className="library-search"
					type="text"
					placeholder="&#xF002;  "
					onChange={event => searchStreams(event.target.value)}
				/>
				<div
					className="library-grid" //videos
				>
					{searchData.map(renderStream)}
				</div>
			</div>
		</div>
	);
}

export default AvatarLibraryPage;
