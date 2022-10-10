import React, { useState, useEffect, useRef } from "react";
import signupButton from "../icons/signup-button.svg";
import submitButton from "../icons/submit-button.svg";
import sample from "../icons/sample-video.svg";
import history from "../services/history";
import { Modal } from "semantic-ui-react";
import axios from "axios";
import toia_home_vid from "../video/TOIA-LOGO-VID.mov";
import Tracker from "../utils/tracker";
import { NotificationManager } from "react-notifications";
import NotificationContainer from "react-notifications/lib/NotificationContainer";

function HomePage() {
	function exampleReducer(state, action) {
		switch (action.type) {
			case "close":
				return { open: false };
			case "open":
				return { open: true };
		}
	}

	let welcome_text = "Welcome to";
	let toia_text = "TOIA";
	let blurb = " communication reimagined.";
	var input1, input2; //these hold all the user login data

	const [state, dispatch] = React.useReducer(exampleReducer, { open: false });

	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [isLoggedIn, setLoginState] = useState(false);

	const { open } = state;

	useEffect(() => {
		if (history.location.state != undefined) {
			setLoginState(true);
			setName(history.location.state.toiaName);
			setLanguage(history.location.state.toiaLanguage);
			setTOIAid(history.location.state.toiaID);
		}

		// Tracker
		new Tracker().startTracking(history.location.state);
	}, []);

	function openModal(e) {
		dispatch({ type: "open" });
		e.preventDefault();
	}

	function logout() {
		history.push({
			pathname: "/",
		});
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

	function submitHandler(e) {
		e.preventDefault();

		let params = {
			email: input1,
			pwd: input2,
		};

		axios.post(`/api/login`, params).then(res => {
			console.log("Response successfully received!");
			console.log(res.data);
			if (res.data == -1) {
				//alert('Email not found');
				NotificationManager.error("Incorrect e-mail address.");
			} else if (res.data == -2) {
				NotificationManager.error("Incorrect password");
				// setHasPasswordError(true);
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

	function signup() {
		if (isLoggedIn == true) {
			history.push({
				pathname: "/mytoia",
				state: {
					toiaName,
					toiaLanguage,
					toiaID,
				},
			});
		} else {
			history.push({
				pathname: "/signup",
			});
		}
	}

	const inlineStyle = {
		modal: {
			height: "560px",
			width: "600px",
		},
	};

	const videoRef = useRef();
	const setPlayBack = () => {
		videoRef.current.playbackRate = 1.5;
	};

	return (
		<div className="home-page">
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
				<div
					onClick={home}
					className="nav-toia_icon app-opensans-normal"
				>
					TOIA
				</div>
				<div
					onClick={about}
					className="nav-about_icon app-monsterrat-black"
				>
					About Us
				</div>
				<div
					onClick={library}
					className="nav-talk_icon app-monsterrat-black"
				>
					Talk To TOIA
				</div>
				<div
					onClick={garden}
					className="nav-my_icon app-monsterrat-black"
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

			<video
				ref={videoRef}
				onCanPlay={() => setPlayBack()}
				className="home-sample-videos home-animate-enter"
				autoPlay
				muted
			>
				<source src={toia_home_vid} type="video/mp4" />
				Your browser does not support the video tag.
			</video>

			<div className="home-overlap-group">
				<div className="home-des home-montserrat-black">{blurb}</div>
				<h1 className="home-toia home-opensans-normal">{toia_text}</h1>
				<div className="home-welcome-text home-montserrat-black">
					{welcome_text}
				</div>
				<div onClick={signup}>
					<img className="home-signup" src={signupButton} />
				</div>
			</div>
			<NotificationContainer />
		</div>
	);
}

export default HomePage;
