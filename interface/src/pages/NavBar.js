import axios from "axios";
import React from "react";
import { Modal } from "semantic-ui-react";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import { logout as LogoutUser } from "../auth/auth";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "../../node_modules/flag-icons/css/flag-icons.min.css";
import API_URLS from "../configs/backend-urls";

//toiaName = null, props.toiaID = null, props.toiaLanguage = null, props.isLoggedIn = false, history = null
const supportedLanguages = ["en", "fr", "ar"];

function NavBar(props) {
	const { t } = useTranslation();

	function exampleReducer(state, action) {
		switch (action.type) {
			case "open":
				return {
					open: true,
				};
			case "close":
			default:
				return {
					open: false,
				};
		}
	}

	const [state, dispatch] = React.useReducer(exampleReducer, { open: false });

	const { open } = state;

	var input1, input2; //these hold all the user login data

	function openModal(e) {
		dispatch({ type: "open" });
		e.preventDefault();
	}

	function home() {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		if (props.isLoggedIn) {
			history.push({
				pathname: "/",
				state: {
					toiaName: props.toiaName,
					toiaLanguage: props.toiaLanguage,
					toiaID: props.toiaID,
				},
			});
		} else {
			history.push({
				pathname: "/",
			});
		}
	}

	function about() {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		if (props.isLoggedIn) {
			history.push({
				pathname: "/about",
				state: {
					toiaName: props.toiaName,
					toiaLanguage: props.toiaLanguage,
					toiaID: props.toiaID,
				},
			});
		} else {
			history.push({
				pathname: "/about",
			});
		}
	}

	function library() {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		if (props.isLoggedIn) {
			history.push({
				pathname: "/library",
				state: {
					toiaName: props.toiaName,
					toiaLanguage: props.toiaLanguage,
					toiaID: props.toiaID,
				},
			});
		} else {
			history.push({
				pathname: "/library",
			});
		}
	}

	function garden(e) {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		if (props.isLoggedIn) {
			history.push({
				pathname: "/mytoia",
				state: {
					toiaName: props.toiaName,
					toiaLanguage: props.toiaLanguage,
					toiaID: props.toiaID,
				},
			});
		} else {
			openModal(e);
		}
	}

	function logout() {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		LogoutUser();
		history.push({
			pathname: "/",
		});
	}
	//

	/*login popup functions*/
	function signup() {
		if (typeof props?.endTranscription === "function") {
			props.endTranscription();
		}
		history.push({
			pathname: "/signup",
		});
	}

	function switch_lang(language) {
		// i18n.changeLanguage(props.toiaLanguage);

		return function (e) {
			console.log("Language changed:", i18n.language);
			if (!supportedLanguages.includes(language)) {
				return;
			}
			i18n.changeLanguage(language);
		};
	}

	function submitHandler(e) {
		e.preventDefault();

		let params = {
			email: input1,
			password: input2,
		};

		axios
			.post(API_URLS.LOGIN, params)
			.then(res => {
				history.push({
					pathname: "mytoia",
				});
			})
			.catch(console.error);
	}

	const inlineStyle = {
		modal: {
			height: "560px",
			width: "600px",
		},
	};

	function login_modal() {
		return (
			<Modal //this is the new pop up menu
				size="large"
				style={inlineStyle.modal}
				open={open}
				onClose={() => dispatch({ type: "close" })}>
				<Modal.Header className="login_header">
					<h1 className="login_welcome login-opensans-normal">
						{t("nav_welcome_back")}
					</h1>
					<p className="login_blurb login-montserrat-black">
						{t("nav_login_request")}
					</p>
				</Modal.Header>

				<Modal.Content>
					<form className="login_popup" onSubmit={submitHandler}>
						<input
							className="login_email login-font-class-1"
							placeholder={"Email"}
							type={"email"}
							required={true}
							onChange={e => (input1 = e.target.value)}
							name={"email"}
						/>
						<input
							className="login_pass login-font-class-1"
							placeholder={"Password"}
							type={"password"}
							required={true}
							onChange={e => (input2 = e.target.value)}
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
							onClick={signup}>
							{t("nav_signup_request")}
						</div>
					</form>
				</Modal.Content>
			</Modal>
		);
	}
	// style = {{direction: i18n.dir(i18n.language)}}  style = {{"unicode-bidi": "plaintext"}}
	return (
		<div className="top-nav-bar">
			{props.showLoginModal ? login_modal() : ""}

			<div className="nav-heading-bar">
				<div className="nav-dropdown">
					<div className="nav-dropbtn">
						<span className={t("current_lang")}></span>
					</div>
					<div className="nav-dropdown-content">
						<a href="#" onClick={switch_lang("en")}>
							<span className="fi fi-us"></span>
						</a>
						<a href="#" onClick={switch_lang("ar")}>
							<span className="fi fi-ae"></span>
						</a>
						{/* <a href="#"><span className="fi fi-es"></span>SP</a> */}
						<a href="#" onClick={switch_lang("fr")}>
							<span className="fi fi-fr"></span>
						</a>
					</div>
				</div>
				<div
					onClick={home}
					className="nav-toia_icon app-opensans-normal">
					{t("nav_toia")}
				</div>
				<div
					onClick={about}
					className="nav-about_icon app-monsterrat-black">
					{t("nav_about_us")}
				</div>
				<div
					onClick={library}
					className="nav-talk_icon app-monsterrat-black ">
					{t("nav_talk_to_toia")}
				</div>
				<div
					onClick={garden}
					className="nav-my_icon app-monsterrat-black ">
					{t("nav_my_toia")}
				</div>
				<div
					onClick={props.isLoggedIn ? logout : openModal}
					className="nav-login_icon app-monsterrat-black">
					{props.isLoggedIn ? t("nav_logout") : t("nav_login")}
				</div>
			</div>
		</div>
	);
}

export default NavBar;
