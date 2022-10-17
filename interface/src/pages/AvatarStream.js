import React, { useState } from 'react';
import Fuse from "fuse.js";
import addButton from "../icons/add-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import trashIcon from "../icons/trash-button.svg";
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
import axios from 'axios';
import nizar from "../images/nizar.jpg";

import NavBar from './NavBar.js';

import { useTranslation } from "react-i18next";

var cardSelected = [];//the videos selected to be edited or deleted

function AvatarSettings() {

  const { t } = useTranslation();

  const [currentUserFullname, setCurrentUserFullname] = useState(null);
  const [currentUserLanguage, setCurrentUserLanguage] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentStream, setCurrentStream] = useState(undefined);
  const [toiaName, setName] = useState(null);
  const [toiaLanguage, setLanguage] = useState(null);
   const [toiaID, setTOIAid] = useState(null);


  React.useEffect(() => {

    if (history.location.state === undefined) {
        history.push({
            pathname: '/'
        });
    }

    setName(history.location.state.toiaName);
    setLanguage(history.location.state.toiaLanguage);
    setTOIAid(history.location.state.toiaID);

    fetchStreamList().then((data) => {
        setCurrentStream(data[0]);
        // console.log(currentStream)
        console.log(data[0]);
    });

    // Tracker
    // new Tracker().startTracking(history.location.state);
    
    getUserData();
}, []);

  var stream =[//Holds info on the stream
    {still: nizar, name:currentUserFullname , privacy: "Public", language: "English", bio:"This is my professor album", ppl: "8", heart:"5", thumbs:"3"}
  ]
  var avatars = [ //This hold the video and information that are apart of the selected stream (Wahib)
    { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
    { still: sampleVideo, question: "What is your favourite sport?", album: "default business"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business personal"},
    { still: sampleVideo, question: "What is your name?", album: "default business" },
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun personal"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default business"},
    { still: sampleVideo, question: "How old are you?", album: "default personal"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
    { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
    { still: sampleVideo, question: "Where do you live?", album: "default business"},
    ];

  /*functions in charge of opening and closing the various pop up menus*/
  function exampleReducer( state, action ) {
    switch (action.type) {
      case 'close':
        return { open: false };
      case 'open':
        return { open: true };
    }
  }
  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
  const { open } = state

  function openModal(e){
      dispatch({ type: 'open' });
      e.preventDefault();
  }
  const [selectedIndex, setSelectedIndex] = useState(null);
  //

  const [data, setData] = useState(avatars);//this sets data to the state of the avatars list
  const [displayItem, setDisplayItem] = useState('none')

  const searchData = (searchval) => {//search function
      if (!searchval) {
      setData(avatars);//if search is empty show all avatars
      return;
      }

      const fuse = new Fuse(data, {
      keys: ["question"], //sets what key will sort through in the avatar list
      });

      const result = fuse.search(searchval);//collects the results of those that match the search
      const match = [];
      if (!result.length) {
          setData([]);//if there are no results show nothing
      } else {
          result.forEach(({item}) => {
              match.push(item);
          });
          setData(match);//display all the cards that match the search value
      }
  };

  const renderCard = (card, index) => {//cards for videos
    return(
        <div className="row">
            <div onClick={edit} className="column" style={{ backgroundImage: `url(${card.still})`}} //image of videos
            />
            <div className="column settings-question">
                <input className="settings-checkbox" type="checkbox" onClick={(event) => handleClick(event, index)} // checkbox
                />
                <h1 className="settings-q settings-font-class-2" //question
                >{card.question}</h1>
                <button onClick={(event) => {cardSelected.push(avatars[index].question); openModal(event)}} className="settings-delete" //trashcan
                ><i class="fa fa-trash"></i></button>
            </div>
        </div>
    )
  }

  const handleClick = (event, index) => {//function that populates and depopulates the cardSelected variable and controls visibility of hidden menu
    let isChecked = event.target.checked;
    if (isChecked == true){//checks if a video has been selected, adds to list and makes hidden menu appear
        cardSelected.push(avatars[index].question);
        setDisplayItem('block');
    }else{
        cardSelected.splice(cardSelected.indexOf(avatars[index].question), 1);//else video is being deselected, deletes from list
        if (cardSelected.length == 0){//checks if no video is being selected, hides hidden menu
            setDisplayItem('none');
        }
    }
  }

  function groupSelect() {//fucntion called when the multiple videos are selected
      if (selectedIndex == null){ //test if function call is for delete
          dispatch({ type: 'close' });
          //return cardSelected as the videos to be group deleted (Wahib)
      } else {
          dispatch({ type: 'close' });
          //return streams[selectedIndex].streamName and cardSelected as videos to move to slected album (Wahib)
          setSelectedIndex(null);
      }
  }

  function changehandler(classname, newVal) { //captures any changes to the stream info
    switch (classname) {
      case "settings-name_box settings-font-class-1":
        stream[0].name = newVal;
        break;
      case "settings-priv_box settings-font-class-1":
        stream[0].privacy = newVal;
        break;
      case "settings-lang_box settings-font-class-1":
        stream[0].language = newVal;
        break;
      case "settings-bio_box settings-font-class-1":
        stream[0].bio = newVal;
        break;
      default:
        break;
    }
  }

  // querying the database for user data
  function getUserData() {
    axios.post(`/api/getUserData`, {
        params: {
            toiaID: history.location.state.toiaID,
        }
    }).then((res) => {
        setCurrentUserFullname(res.data[0].first_name + " " + res.data[0].last_name);
        setCurrentUserLanguage(res.data[0].language);
        setCurrentUserEmail(res.data[0].email);
    })
  }

  function fetchStreamList() {
    return new Promise(((resolve) => {
        axios.post(`/api/getUserStreams`, {
            params: {
                toiaID: history.location.state.toiaID,
                toiaName: history.location.state.toiaName
            }
        }).then((res) => {
            resolve(res.data);
        });
    }));
  }

  /*navigations to pages from buttons*/
  function edit() {
    history.push({
      pathname: '/editrecorder',
      state: {
        toiaName,
        toiaLanguage,
        toiaID
    }
    });
  }

  function add() {
      history.push({
          pathname: '/recorder',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
        }
      });
  }

  const inlineStyle = {
    modal : {
        height: '100px',
        width: '600px',
    }
  };

  return (
    <form className="avatar-settings-page-1">
      <Modal //This is the warning pop menu, that shows whenever you delete or move videos
      size='large'
      closeIcon={true}
      style={inlineStyle.modal}
      open={open}
      onClose={() => dispatch({ type: 'close' })}
      >
          <Modal.Header className="login_header">
          <h1 className="login_welcome login-opensans-normal">Are You Sure??</h1>
          <p className="login_blurb login-montserrat-black">This action will be irreversible</p>
          </Modal.Header>
          <Modal.Actions>
          <Button color='green' inverted onClick={groupSelect}>
              <i class="fa fa-check"></i>
          </Button>
          </Modal.Actions>
      </Modal>

      <NavBar
            toiaName={toiaName}
            toiaID={toiaID}
            isLoggedIn={true} // {isLoggedIn}
            toiaLanguage={toiaLanguage}
            history={history}
            showLoginModal={true}
            />
      
      <div className="settings-section1" //the first section
      >
        <h1 className="settings-settings settings-font-class-3 " // main heading
        >{stream[0].name}</h1>
        <div className="settings-name settings-font-class-1" //the name input field
        >{t("name_input")}</div>
        <input
            className="settings-name_box settings-font-class-1"
            defaultValue = {stream[0].name}
            type={"text"}
            onChange={e=>changehandler(e.target.className, e.target.value)}
        />
        <div className="settings-priv settings-font-class-1" //the privacy input feild
        >{t("privacy_input")}</div>
        <select className="settings-priv_box settings-font-class-1" onChange={e=>changehandler(e.target.className, e.target.value)}  /*required={true}*/>
          <option value="" disabled selected hidden>{stream[0].privacy}</option>
          <option value="public">{t("privacy_option_public")}</option>
          <option value="private">{t("privacy_option_private")}</option>
        </select>
        <div className="settings-lang settings-font-class-1" //the language input field
        >{t("language_input")}</div>
        <select className="settings-lang_box settings-font-class-1" onChange={e=>changehandler(e.target.className, e.target.value)} /*required={true}*/>
            <option value="" disabled selected hidden>{stream[0].language}</option>
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
        <div className="settings-bio settings-font-class-1" // bio input field
        >{t("bio_input")}</div>
        <textarea
            className="settings-bio_box settings-font-class-1"
            defaultValue = {stream[0].bio}
            type={"text"}
            onChange={e=>changehandler(e.target.className, e.target.value)}
        />
        <img className="settings-still" src={stream[0].still} //thumbnail image for stream
        />
        <div className="settings-menu" //the stats that appear under the image
        >
            <p style={{marginRight: 40}}>{stream[0].ppl}&nbsp;<i class="fa fa-users"></i></p>
            <p style={{marginRight: 25}}>{stream[0].heart}<i  class="fa fa-heart"></i></p>
            <p style={{marginLeft: 5}}>{stream[0].thumbs}&nbsp;<i  class="fa fa-thumbs-up"></i></p>
        </div>
      </div>
      <div className="settings-section2" //the second section of the page that has the search bar and videos
      >
        <input className="settings-search" type="text" placeholder="&#xF002;" onChange={(event) => searchData(event.target.value)} //search bar
        />
        <div className ="settings-grid" //videos
        >
            {data.map(renderCard)}
        </div>
        <div className="settings-hidden" style={{display: displayItem}} //the hidden menu that appears when you select a function
        >
            <div onClick={openModal}><img className="settings-trash" src={trashIcon} /></div>
        </div>
        <div onClick={add}><img className="settings-add" src={addButton} //the add video button
        /></div>
        <h1 className="settings-video-text settings-font-class-3">{t("add_video")}</h1>
      </div>
    </form>
  );
}

export default AvatarSettings;
