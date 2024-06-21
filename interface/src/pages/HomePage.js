import React, { useEffect, useRef, useState } from "react";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import signupButton from "../icons/signup-button.svg";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import Tracker from "../utils/tracker";
import toia_home_vid from "../video/TOIA-LOGO-VID.mov";
import toia_final_vid from "../video/toia-final-vid.mp4";

import NavBar from "./NavBar.js";

import { useTranslation } from "react-i18next";

function HomePage() {
	const { t } = useTranslation();

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [isLoggedIn, setLoginState] = useState(false);

	const [videoEnded, setVideoEnded] = useState(false);

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

	function about() {
		history.push({
			pathname: "/about",
		});
	}

	const videoRef = useRef();

	const setPlayBack = () => {
		videoRef.current.playbackRate = 1;
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
				showSignupModal={true}
			/>

			{/* <video
				ref={videoRef}
				onCanPlay={() => setPlayBack()}
				onEnded={() => setVideoEnded(true)}
				className={`home-sample-videos home-animate-enter ${videoEnded ? 'moved' : ''}`}
				autoPlay
				muted>
				<source src={toia_home_vid} type="video/mp4" />
				Your browser does not support the video tag.
			</video> */}

			{/* <video
				ref={videoRef}
				onCanPlay={() => setPlayBack()}
				onEnded={() => setVideoEnded(true)}
				width={"70%"}
				controls
				>
				<source src={toia_final_vid} type="video/mp4" />
				Your browser does not support the video tag.
			</video> */}

			<iframe width="966" height="543" className="toia-home-video" src="https://www.youtube.com/embed/EsYg0ySfuTE" title="TOIA Teaser" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
			

			<div className="home-overlap-group">
				
				{/* <h1
					className={`home-welcome-text home-montserrat-black ${t(
						"alignment",
					)}`}>
					{" "}
					{t("welcome")}{" "}
				</h1>
				<h1 className="home-toia home-opensans-normal">TOIA</h1> */}

				<button className="home-about heading-small" onClick={about} src={submitButton}>Learn More</button>

				{/* <div onClick={about}>
					<img className="home-signup" src={signupButton} alt="" />
				</div> */}
			</div>
			<NotificationContainer />
		</div>
	);
}

export default HomePage;
