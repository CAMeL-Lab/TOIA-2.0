import { Modal } from "semantic-ui-react";
import React, { useState } from "react";
import {
	NotificationContainer,
	NotificationManager,
} from "react-notifications";
import axios from "axios";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";
import { logout as LogoutUser } from "../auth/auth";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import "../../node_modules/flag-icons/css/flag-icons.min.css";
import API_URLS from "../configs/backend-urls";

//toiaName = null, props.toiaID = null, props.toiaLanguage = null, props.isLoggedIn = false, history = null
const supportedLanguages = ["en", "fr", "ar", "es"];
// const rightLanguages = [];
// const rightLanguages = ["ar"];

function NavBar(props) {
	const { t } = useTranslation();

	function exampleReducer(state, action) {
		switch (action.type) {
			case "openLogin":
				return { loginOpen: true, signupOpen: false };
			case "openSignup":
				return { loginOpen: false, signupOpen: true };
			case "close":
				return { loginOpen: false, signupOpen: false };
			default:
				return state;
		}
	}
	
	const initialState = { loginOpen: false, signupOpen: false };
	const [state, dispatch] = React.useReducer(exampleReducer, initialState);
	
	

	const { open } = state;

	var input1, input2; //these hold all the user login data

	function openLoginModal(e) {
		dispatch({ type: "openLogin" });
		e.preventDefault();
	}
	
	function openSignupModal(e) {
		dispatch({ type: "openSignup" });
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
			openLoginModal(e);
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


	const inlineStyleLogin = {
		modal: {
			height: "560px",
			width: "600px",
		},
	};

	const inlineStyleLoginMobile = {
		modal: {
			height: "580px",
			width: "380px",
		},
	};

	const inlineStyleSignupMobile = {
		modal: {
			height: "680px",
			width: "380px",
		},
	};

	const inlineStyleSignup = {
		modal: {
			height: "660px",
			width: "600px",
		},
	};

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

	function LoginSubmitHandler(e) {
		e.preventDefault();

		let params = {
			email: input1,
			password: input2,
		};

		axios
			.post(API_URLS.LOGIN(), params)
			.then(res => {
				history.push({
					pathname: "mytoia",
				});
			})
			.catch(error => {
				const response = error.response;
				if (response.status === 401) {
					if (response.data.error) {
						alert(response.data.error);
					} else {
						alert("Incorrect email or password");
					}
				}
			});
	}

	function toggleNavbar() {
		const navItemsRight = document.querySelector('.nav-right-group');
		const navItemsLeft = document.querySelector('.nav-left-group');
		const navHeaderBar = document.querySelector('.nav-heading-bar');
		navItemsRight.classList.toggle('nav-active');
		navItemsLeft.classList.toggle('nav-active');
		navHeaderBar.classList.toggle('header-active');
	}

	function login_modal() {
		return (
			<Modal 
				size="large"
				style={window.innerWidth < 440 ? inlineStyleLoginMobile.modal : inlineStyleLogin.modal}
				open={state.loginOpen}
				onClose={() => dispatch({ type: "close" })}
			>
				<Modal.Header className="login_header">
					<h1 className="heading-big">
						{t("nav_welcome_back")}
					</h1>
					<p className="text-big">
						{t("nav_login_request")}
					</p>
				</Modal.Header>
	
				<Modal.Content>
				<form className="login_popup" onSubmit={LoginSubmitHandler}>
					<input
						className="login-email text-big"
						placeholder={"Email Address"}
						type={"email"}
						required={true}
						onChange={e => (input1 = e.target.value)}
						name={"email"}
					/>

					<input
						className="login-pass text-big"
						placeholder={"Password"}
						type={"password"}
						required={true}
						onChange={e => (input2 = e.target.value)}
						name={"pass"}
					/>

					<button className="heading-small login-submit" src={submitButton} alt="Submit">Log in</button>

					{props.showLoginModal ? signup_modal() : ""}
					<div className="login-text text-big" onClick={openSignupModal}>Don't have an account? <span className="signup-link">Sign up</span></div>
					</form>
				</Modal.Content>
			</Modal>
		);
	}


	const [language, setLanguage] = useState("");
	const [fname, setFName] = useState("");
	const [lname, setLname] = useState("");
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [cpass, setCPass] = useState("");
	const [profilePic, setProfilePic] = useState();
	const [inputDisabled, setInputDisabled] = useState(false);

	function SignupSubmitHandler(event) {
		setInputDisabled(true);
		event.preventDefault();
		if (pass === cpass) {
			let form = new FormData();
			form.append("profile_pic", profilePic);
			form.append("first_name", fname);
			form.append("last_name", lname);
			form.append("email", email);
			form.append("password", pass);
			form.append("language", language);
			axios
				.post(API_URLS.SIGN_UP(), form)
				.then(res => {
					NotificationManager.success("Account created. Please check your email for confirmation");
					// Redirect in 6 seconds
					setTimeout(() => {
						history.push("/login");
					}, 6000);
				})
				.catch(error => {
					setInputDisabled(false);
					if (error.response) {
						// The request was made and the server responded with a status code
						// that falls out of the range of 2xx
						console.log(error.response.data);
						console.log(error.response.status);
						console.log(error.response.headers);
					} else if (error.request) {
						// The request was made but no response was received
						// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
						// http.ClientRequest in node.js
						console.log(error.request);
					} else {
						// Something happened in setting up the request that triggered an Error
						console.log("Error", error.message);
					}
				});
		} else {
			setInputDisabled(false);
			NotificationManager.error("Passwords need to match");
		}
	}

	function submitPic(event) {
		event.preventDefault();
	}

	function setImg(e) {
		setProfilePic(e.target.files[0]);
		e.preventDefault();
	}

	function signup_modal() {
		return (
			<Modal 
				size="large"
				style={window.innerWidth < 440 ? inlineStyleSignupMobile.modal : inlineStyleSignup.modal}
				open={state.signupOpen}
				onClose={() => dispatch({ type: "close" })}
			>
				<Modal.Header className="login_header">
					<h1 className="heading-big">
						Get Started
					</h1>
					<p className="text-big description">
						{t("signup_text")}
					</p>
				</Modal.Header>
	
				<Modal.Content>
				<form className="login_popup" onSubmit={SignupSubmitHandler}>
					<div className="signup-name-container">
						<input
							className="text-big signup-firstname"
							placeholder={t("signup_first_name")}
							type={"text"}
							required={true}
							onChange={e => setFName(e.target.value)}
						/>

						<input
							className="text-big signup-lastname"
							placeholder={t("signup_last_name")}
							type={"text"}
							required={true}
							onChange={e => setLname(e.target.value)}
						/>
					</div>

					<input
						className="text-big signup-email-add"
						placeholder={t("signup_email")}
						type={"email"}
						required={true}
						onChange={e => setEmail(e.target.value)}
					/>

					
					<select
						className="text-big signup-language-select"
						onChange={e => setLanguage(e.target.value)}
						required={true}>
						<option value="" disabled selected hidden>
							Select Language...
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

					<input
						className="text-big signup-password"
						placeholder={t("signup_create_password")}
						type={"password"}
						required={true}
						onChange={e => setPass(e.target.value)}
					/>

					<input
						className="text-big signup-password-confirm"
						placeholder={t("signup_confirm_password")}
						type={"password"}
						required={true}
						onChange={e => setCPass(e.target.value)}
					/>
					
					
					<form onSubmit={submitPic}>
						<input
							className="login-font-class-1"
							type="file"
							id="img"
							name="img"
							accept="image/*"
							onChange={setImg}
							hidden
						/>
					</form>

					<label for="img" class="text-big image-upload-label">{t("signup_upload_picture")}</label>
					<span id="file-chosen" class="text-small">No file chosen</span>

					<button className="heading-small signup-submit" src={submitButton} alt="Submit" disabled={inputDisabled}>Sign up</button>

				
					</form>

					{/* <script>
						const actualBtn = document.getElementById('img');

						const fileChosen = document.getElementById('file-chosen');

						actualBtn.addEventListener('change', function(){
						fileChosen.textContent = this.files[0].name
						})
					</script> */}
				</Modal.Content>
			</Modal>
		);
	}



	// helloooooo

	
	// style = {{direction: i18n.dir(i18n.language)}}  style = {{"unicode-bidi": "plaintext"}}
	return (
		<div className="top-nav-bar">
			{props.showLoginModal ? login_modal() : ""}
			{props.showLoginModal ? signup_modal() : ""}

			<div className="nav-heading-bar">
				<div className="nav-hamburger-icon">
					<span onClick={toggleNavbar}>
						&#9776;
					</span>
					<div className="nav-dropdown-hamburger">
						<div className="nav-dropbtn-hamburger">
							<span className={t("current_lang")}></span>
						</div>
						<div className="nav-dropdown-hamburger-content">
							<a href="#" onClick={switch_lang("en")}>
								<span>EN</span>
								{/* <span className="fi fi-us"></span> */}
							</a>
							<a href="#" onClick={switch_lang("ar")}>
								<span>عربي</span>
								{/* <span className="fi fi-ae"></span> */}
							</a>
							<a href="#" onClick={switch_lang("fr")}>
								<span>FR</span>
								{/* <span className="fi fi-fr"></span> */}
							</a>
							<a href="#" onClick={switch_lang("es")}>
								<span>ES</span>
								{/* <span className="fi fi-es"></span> */}
							</a>
						</div>
					</div>
					<span onClick={home}
						className="nav-toia-hamburger app-opensans-normal">
						{t("nav_toia")}
					</span>
				</div>
				<div className="nav-left-group">
					<div className="nav-dropdown">
						<div className="nav-dropbtn">
							<span className={t("current_lang")}></span>
						</div>
						<div className="nav-dropdown-content">
							<a href="#" onClick={switch_lang("en")}>
								<span>EN</span>
								{/* <span className="fi fi-us"></span> */}
							</a>
							<a href="#" onClick={switch_lang("ar")}>
								<span>عربي</span>
								{/* <span className="fi fi-ae"></span> */}
							</a>
							<a href="#" onClick={switch_lang("fr")}>
								<span>FR</span>
								{/* <span className="fi fi-fr"></span> */}
							</a>
							<a href="#" onClick={switch_lang("es")}>
								<span>ES</span>
								{/* <span className="fi fi-es"></span> */}
							</a>
						</div>
					</div>
					<div
						onClick={home}
						className="nav-toia_icon app-opensans-normal">
						{t("nav_toia")}
					</div>
				</div>

				<div className="nav-right-group">
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
						onClick={props.isLoggedIn ? logout : openLoginModal}
						className="nav-login_icon app-monsterrat-black">
						{props.isLoggedIn ? t("nav_logout") : t("nav_login")}
					</div>
				</div>
			</div>
		</div>

		
	);
}

export default NavBar;
