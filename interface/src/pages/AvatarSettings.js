import './App.css';
import './AvatarSettings.css';
import React, {useState} from "react";
import history from '../services/history';
import sampleVideo from "../icons/sample-video.svg";
import axios from 'axios';

function AvatarSettings() {

  var albums =[//holds the information about the albums, like their names, languages , privacy settings
    {still: sampleVideo, name: "Default", privacy: "Public", language: "English", bio:"This is my default album"},
    {still: sampleVideo, name: "Business", privacy: "Private", language: "English", bio:"This is my business album"},
    {still: sampleVideo, name: "Personal", privacy: "Public", language: "English", bio:"This is my personal album"},
    {still: sampleVideo, name: "Fun", privacy: "Private", language: "English", bio:"This is my fun album"},
    {still: sampleVideo, name: "School", privacy: "Select Priacy Settings...", language: "Select Language...", bio:"Enter more information about your new album"},
  ]

  const renderAlbums = (album, index) => {
    return(
      <div className="settings-group">
        <img className="settings-still" src={album.still}/>
        <div className="settings-name settings-font-class-1">Name: </div>
        <input
            className="settings-name_box settings-font-class-1"
            defaultValue = {album.name}
            type={"text"}
            onChange={e=>changehandler(e.target.className, e.target.value, index)}
        />
        <div className="settings-priv settings-font-class-1">Privacy: </div>
        <select className="settings-priv_box settings-font-class-1" onChange={e=>changehandler(e.target.className, e.target.value, index)}  /*required={true}*/>
          <option value="" disabled selected hidden>{album.privacy}</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <div className="settings-lang settings-font-class-1">Language: </div>
        <select className="settings-lang_box settings-font-class-1" onChange={e=>changehandler(e.target.className, e.target.value, index)} /*required={true}*/>
            <option value="" disabled selected hidden>{album.language}</option>
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
        <div className="settings-bio settings-font-class-1">Bio: </div>
        <textarea
            className="settings-bio_box settings-font-class-1"
            defaultValue = {album.bio}
            type={"text"}
            onChange={e=>changehandler(e.target.className, e.target.value, index)}
        />
      </div>
    )
  }

  function changehandler(classname, newVal, index) {
    switch (classname) {
      case "settings-name_box settings-font-class-1":
        albums[index].name = newVal;
        break;
      case "settings-priv_box settings-font-class-1":
        albums[index].privacy = newVal;
        break;
      case "settings-lang_box settings-font-class-1":
        albums[index].language = newVal;
        break;
      case "settings-bio_box settings-font-class-1":
        albums[index].bio = newVal;
        break;
      default:
        break;
    }
  }

  function home() {
    history.push({
      pathname: '/',
    });
  }

  function library() {
    history.push({
      pathname: '/library',
    });
  }

  function garden() {
    history.push({
        pathname: '/garden',
    });
  }

  function logout(){
      //logout function needs to be implemented (wahib)
      history.push({
          pathname: '/',
        });
  }

  return (
    <form className="avatar-settings-page-1">
    <div className="nav-heading-bar">
        <div onClick={home} className="nav-toia_icon app-opensans-normal">
            TOIA
        </div>
        <div className="nav-about_icon app-monsterrat-black">
            About Us
        </div>
        <div onClick={library} className="nav-talk_icon app-monsterrat-black">
            Talk To TOIA
        </div>
        <div onClick={garden} className="nav-my_icon app-monsterrat-black">
            My TOIA
        </div>
        <div onClick={logout}className="nav-login_icon app-monsterrat-black">
            Logout
        </div>
    </div>
    <h1 className="settings-settings settings-font-class-3 ">Album Settings</h1>
    <p className="settings-edit settings-font-class-2 settings-animate-enter">Edit the follwing about your albums</p>
    <div>
        {albums.map(renderAlbums)}
    </div>
    </form>
  );
}

export default AvatarSettings;