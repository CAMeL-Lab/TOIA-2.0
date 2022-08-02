import React, {useState} from "react";
import submitButton from "../icons/submit-button.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import NavBar from './NavBar.js';

import i18n from "i18next";
import { Trans, useTranslation } from "react-i18next";

function SignUpPage() {

    const { t } = useTranslation();

    function exampleReducer(state, action) {
        switch (action.type) {
            case 'close':
                return {open: false};
            case 'open':
                return {open: true};
        }
    }

    let isLogin = false; // this will tell if user is logged in to determine whether my TOIA will activate login pop *Wahib*
    var input1, input2; //these hold all the user login data

    const [language, setLanguage] = useState('');
    const [fname, setFName] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [cpass, setCPass] = useState('');
    const [profilePic, setProfilePic] = useState();

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    var [hasEmailError, setHasEmailError] = useState(false);
    var [hasPasswordError, setHasPasswordError] = useState(false);
    const {open} = state

    function openModal(e) {
        dispatch({type: 'open'});
        e.preventDefault();
    }

    function submitPic(event) {
        console.log('we here');
        console.log(event.target.files[0]);
        event.preventDefault();
    }

    function setImg(e) {
        setProfilePic(e.target.files[0]);
        e.preventDefault();
    }

    function submitHandler(event) {
        event.preventDefault();
        if (pass === cpass) {

            let form = new FormData();
            form.append('blob', profilePic);
            form.append('firstName', fname);
            form.append('lastName', lname);
            form.append('email', email);
            form.append('pwd', pass);
            form.append('language', language);
            console.log(form);
            axios.post(`/api/createTOIA`, form).then((res) => {
                if (res.status === 200) {
                    console.log(`Account created successfully ${res.data}`);
                    history.push({
                        pathname: '/mytoia',
                        state: {
                            toiaName: fname,
                            toiaLanguage: language,
                            toiaID: res.data.new_toia_ID
                        }
                    });
                }
            }).catch(err => {
                console.log(err);
                NotificationManager.error("Email already exists!");
            });
        } else {
            NotificationManager.error("Passwords need to match");
        }
    }


    const inlineStyle = {
        modal: {
            height: '560px',
            width: '600px',
        }
    };


    return (
        <div>
            {NavBar(null, null, null, false, history, dispatch, open, t)}
            <form className="signup-page" onSubmit={submitHandler}>
                <div className="signup-group">
                    <h1 className="signup-title signup-font-class-3 ">Get Started</h1>
                    <p className="signup_text signup-font-class-2 signup-animate-enter">{t("signup_text")}</p>
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

                    <div className="signup-language signup-font-class-1 ">{t("signup_language")}</div>
                    <select className="signup-lang signup-font-class-1" onChange={e => setLanguage(e.target.value)}
                            required={true}>
                        <option value="" disabled selected hidden>Select Language...</option>
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
                    <div className="signup-photo-upload signup-font-class-1" //delete button, function TBD
                    >
                        <form onSubmit={submitPic}>
                            <label for="img">{t("signup_upload_picture")}:</label>
                            <input className="signup-photo-upload-choose signup-font-class-1" type="file" id="img"
                                   name="img" accept="image/*" onChange={setImg}/>
                            {/* <input className= "signup-photo-upload-submit signup-font-class-1" type="submit"/> */}
                        </form>
                    </div>
                    <input className="signup-button smart-layers-pointers " type="image" src={submitButton}
                           alt="Submit"/>

                </div>
            </form>

            <NotificationContainer/>
        </div>
    );
}

export default SignUpPage;
