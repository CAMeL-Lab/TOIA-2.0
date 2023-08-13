import React, { useEffect, useRef, useState } from "react";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import signupButton from "../icons/signup-button.svg";
import history from "../services/history";
import Tracker from "../utils/tracker";
import toia_home_vid from "../video/TOIA-LOGO-VID.mov";

import NavBar from "./NavBar.js";

import { useTranslation } from "react-i18next";

function HomePage() {
	const { t } = useTranslation();

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [isLoggedIn, setLoginState] = useState(false);

	useEffect(() => {
		if (history.location.state !== undefined) {
			setLoginState(true);
			setName(history.location.state.toiaName);
			setLanguage(history.location.state.toiaLanguage);
			setTOIAid(history.location.state.toiaID);
		}

		// Tracker
		new Tracker().startTracking(history.location.state);
	}, []);

	function signup() {
		history.push({
			pathname: "/signup",
		});
	}

	const videoRef = useRef();

	const setPlayBack = () => {
		videoRef.current.playbackRate = 1.5;
	};

	return (
		<div className="home-page">
			<NavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={isLoggedIn}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={true}
			/>

			<video
				ref={videoRef}
				onCanPlay={() => setPlayBack()}
				className="home-sample-videos home-animate-enter"
				autoPlay
				muted>
				<source src={toia_home_vid} type="video/mp4" />
				Your browser does not support the video tag.
			</video>

			<div className="home-overlap-group">
				<div
					className={`home-des home-montserrat-black ${t(
						"alignment",
					)}`}>
					{" "}
					{t("tagline")}
				</div>
				<h1 className="home-toia home-opensans-normal">TOIA</h1>
				<div
					className={`home-welcome-text home-montserrat-black ${t(
						"alignment",
					)}`}>
					{" "}
					{t("welcome")}{" "}
				</div>
				<div onClick={signup}>
					<img className="home-signup" src={signupButton} alt="" />
				</div>
			</div>
			<NotificationContainer />
		</div>
	);
}

export default HomePage;
