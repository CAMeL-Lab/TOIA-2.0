import React from "react";
import submitButton from "../icons/submit-button.svg";
import video from "../icons/sample-video.svg"
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';
import Tracker from "../utils/tracker";

import NavBar from './NavBar.js';

import { Trans, useTranslation } from "react-i18next";

function AvatarViewPage() {

    const { t } = useTranslation();

    const [name, setName] = React.useState(null);
    const [language, setLanguage] = React.useState(null);
    const [bio, setBio] = React.useState(null);
    const [avatarID,setAvatarID] = React.useState(null);
    let isLogin = false;
    var input1, input2;

    const [interactionLanguage, setInteractionLanguage] = React.useState(null);
    
    React.useEffect(() => {
    
        axios.get(`/api/getAvatarInfo`,{params:{
            avatarID: history.location.state.id_avatar
        }}).then((res)=>{
            setName(res.data.name);
            setLanguage(res.data.language);
            setBio(res.data.bio);
            setAvatarID(history.location.state.id_avatar);
        });

        // Tracker
        new Tracker().startTracking(history.location.state);
    });

    function submitHandler(event){
        event.preventDefault();
        history.push({
            pathname: '/player',
            state: {
                name,
                language,
                avatarID,
                interactionLanguage
            }
        });
    }
    //a function will be needed to send input5 to database (wahib)
    
    return (
        <div className="view-page">
            <NavBar
            toiaName={toiaName}
            toiaID={toiaID}
            isLoggedIn={true}  // {isLoggedIn}
            toiaLanguage={"en"}
            history={history}
            showLoginModal={true}
            />
            <h1 className="view-title view-font-class-1 ">Here is infromation on the TOIA selected</h1>
            <img className="view-still" src={video}/>

            <div className="view-group">
                <div className="view-name view-font-class-1 ">{t("show_name")}</div>
                <input
                    className="view-name_box view-font-class-1"
                    defaultValue = {name}
                    type={"text"}
                />
                <div className="view-creator view-font-class-1 ">{t("show_album")}</div>
                <input
                    className="view-creator_box view-font-class-1"
                    defaultValue = {name}
                    type={"text"}
                />
                <div className="view-lang view-font-class-1 ">{t("show_language")}</div>
                <input
                    className="view-lang_box view-font-class-1"
                    defaultValue = {language}
                    type={"text"}
                />
                <div className="view-bio view-font-class-1 ">{t("show_bio")}</div>
                <textarea
                    className="view-bio_box view-font-class-1"
                    defaultValue = {bio}
                    type={"text"}
                />
                <select className="view-lang2_box view-font-class-1" >
                    <option value="" disabled selected hidden>{t("language_preference_input")}</option>
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
            </div>
        <input  onClick={submitHandler} className="view-submit-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
        </div>
    );
}

export default AvatarViewPage;