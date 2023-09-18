import axios from "axios";
import React, { useState } from "react";
import {
	NotificationContainer,
	NotificationManager,
} from "react-notifications";
import submitButton from "../icons/submit-button.svg";
import history from "../services/history";

import NavBar from "./NavBar.js";

import { useTranslation } from "react-i18next";
import API_URLS from "../configs/backend-urls";

function SignUpPage() {
	const { t } = useTranslation();

	const [language, setLanguage] = useState("");
	const [fname, setFName] = useState("");
	const [lname, setLname] = useState("");
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [cpass, setCPass] = useState("");
	const [profilePic, setProfilePic] = useState();
	const [inputDisabled, setInputDisabled] = useState(false);

	function submitHandler(event) {
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

	return (
		<div>
			<NavBar
				toiaName={null}
				toiaID={null}
				isLoggedIn={false}
				toiaLanguage={null}
				history={history}
				showLoginModal={true}
			/>
			<form className="signup-page" onSubmit={submitHandler}>
				<div className="signup-group">
					<h1 className="signup-title signup-font-class-3 ">
						Get Started
					</h1>
					<p className="signup_text signup-font-class-2 signup-animate-enter">
						{t("signup_text")}
					</p>
					<input
						className="signup-fname signup-font-class-1"
						placeholder={t("signup_first_name")}
						type={"text"}
						required={true}
						onChange={e => setFName(e.target.value)}
					/>
					<input
						className="signup-lname signup-font-class-1"
						placeholder={t("signup_last_name")}
						type={"text"}
						required={true}
						onChange={e => setLname(e.target.value)}
					/>
					<input
						className="signup-email signup-font-class-1"
						placeholder={t("signup_email")}
						type={"email"}
						required={true}
						onChange={e => setEmail(e.target.value)}
					/>

					<div className="signup-language signup-font-class-1 ">
						{t("signup_language")}
					</div>
					<select
						className="signup-lang signup-font-class-1"
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
						className="signup-pass signup-font-class-1"
						placeholder={t("signup_create_password")}
						type={"password"}
						required={true}
						onChange={e => setPass(e.target.value)}
					/>
					<input
						className="signup-pass1 signup-font-class-1"
						placeholder={t("signup_confirm_password")}
						type={"password"}
						required={true}
						onChange={e => setCPass(e.target.value)}
					/>
					<div
						className="signup-photo-upload signup-font-class-1" //delete button, function TBD
					>
						<form onSubmit={submitPic}>
							<label htmlFor="img">
								{t("signup_upload_picture")}:
							</label>
							<input
								className="signup-photo-upload-choose signup-font-class-1"
								type="file"
								id="img"
								name="img"
								accept="image/*"
								onChange={setImg}
							/>
						</form>
					</div>
					<input
						className="signup-button smart-layers-pointers "
						type="image"
						src={submitButton}
						alt="Submit"
						disabled={inputDisabled}
					/>
				</div>
			</form>

			<NotificationContainer />
		</div>
	);
}

export default SignUpPage;
