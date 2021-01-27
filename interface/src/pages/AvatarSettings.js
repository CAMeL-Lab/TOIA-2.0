import './App.css';
import './AvatarSettings.css';
import React, {useState} from "react";
import submitButton from "../icons/submit-button.svg";
import backButton from "../icons/back-button.svg";
import history from '../services/history';
import axios from 'axios';

function AvatarSettings() {

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [privacySetting, setPrivacySetting] = useState('');
  const [bio, setBio] = useState('');

  function submitHandler(event){
    event.preventDefault();
    axios.post('http://localhost:3000/createAvatar',
      {
        name,
        language,
        privacySetting,
        bio
      }).then((res)=>{
        history.push({
          pathname: '/recorder',
          state: {
            name:name,
            language:language,
            new_avatar_ID: res.data.new_avatar_ID
          }
        });
      });
  }

  function goBack(){
    history.goBack();
  }

  return (
    <form className="avatar-settings-page-1" onSubmit={submitHandler}>
    <div className="settings-group">
    <h1 className="settings-settings settings-font-class-3 ">Settings</h1>
    <p className="settings-edit settings-font-class-2 settings-animate-enter">Edit the follwing about your avatar</p>
    <input
      className="settings-name settings-font-class-1"
      placeholder="Name"
      type="text"
      required={true}
      onChange={e=>setName(e.target.value)}
    />

    <div className="settings-privacy settings-font-class-1 ">Privacy Settings:</div>
    <select className="settings-priv settings-font-class-1" onChange={e=>setPrivacySetting(e.target.value)}  /*required={true}*/>
        <option value="" disabled selected hidden>Select Privacy Settings...</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
    </select>


    <div className="settings-language settings-font-class-1 ">Language:</div>
        <select className="settings-lang settings-font-class-1" onChange={e=>setLanguage(e.target.value)} /*required={true}*/>
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


    <textarea
      className="settings-bio settings-font-class-1"
      placeholder="Tell us about your TOIA"
      type="text"
      onChange={e=>setBio(e.target.value)}
    ></textarea>
    </div>
    <input className="settings-submit-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
    <div onClick={goBack}><img className="settings-back_icon" src={backButton} /></div>
    </form>
  );
}

export default AvatarSettings;