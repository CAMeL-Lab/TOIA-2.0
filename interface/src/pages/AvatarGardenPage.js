import './App.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from 'react';
import Fuse from "fuse.js";
import Carousel from 'react-elastic-carousel'
import styled from "styled-components";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import addButton from "../icons/add-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import moveIcon from "../icons/move-button.svg";
import trashIcon from "../icons/trash-button.svg";
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
// import Carousel,  { slidesToShowPlugin } from '@brainhubeu/react-carousel';
// import Carousel from 'react-bootstrap/Carousel';
import test_video from "../video/TOIA-LOGO-VID.mov"


import '@brainhubeu/react-carousel/lib/style.css';
import axios from 'axios';
import env from './env.json';
import './AvatarGardenPage.css';
import wahib from "../images/wahib.jpg";
import kertu from "../images/kertu.jpg";
import erin from "../images/erin.jpeg";

var cardSelected = [];//the videos selected to be edited or deleted

function AvatarGardenPage() {

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);
    const [videoList,setVideoList]=useState([]);
    const [streamList,setStreamList]=useState([]);

    const [newStreamName, setNewStreamName] = useState(null);
    const [newStreamPrivacy, setNewStreamPrivacy] = useState('public');
    const [newStreamBio, setNewStreamBio] = useState(null);

    //sample video entry: {question:What is your name?, stream: "fun business"}

    React.useEffect(() => {

        if(history.location.state==undefined){
            history.push({
                pathname: '/'
            });
        }

        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);

        axios.post(`${env['server-url']}/getUserVideos`,{
            params:{
                toiaID: history.location.state.toiaID
            }
        }).then((res)=>{
            setVideoList(res.data);

            axios.post(`${env['server-url']}/getUserStreams`,{
                params:{
                    toiaID: history.location.state.toiaID
                }
            }).then((res)=>{
                console.log(res.data);
                setStreamList(res.data);
            });
        });

    },[]);

    /*functions in charge of opening and closing the various pop up menus*/
    function exampleReducer( state, action ) { //for warning window when you delete
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
    //

    function exampleReducer2( state2, action ) { // for account settings window
        switch (action.type) {
          case 'close':
            return { open2: false };
          case 'open':
            return { open2: true };
        }
    }
    const [state2, dispatch2] = React.useReducer(exampleReducer2, {open2: false,})
    const { open2 } = state2

    function openModal2(e){
        dispatch2({ type: 'open' });
        e.preventDefault();
    }
    //

    function exampleReducer3( state3, action ) { // for stream settings window
        switch (action.type) {
          case 'close':
            return { open3: false };
          case 'open':
            return { open3: true };
        }
    }
    const [state3, dispatch3] = React.useReducer(exampleReducer3, {open3: false,})
    const { open3 } = state3

    function openModal3(e){
        dispatch3({ type: 'open' });
        e.preventDefault();
    }

    function exampleReducer4( state4, action ) { // window for adding a stream
        switch (action.type) {
          case 'close':
            return { open4: false };
          case 'open':
            return { open4: true };
        }
    }
    const [state4, dispatch4] = React.useReducer(exampleReducer4, {open4: false,})
    const { open4 } = state4

    function openModal4(e){
        dispatch4({ type: 'open' });
        e.preventDefault();
    }

    function exampleReducer5( state5, action ) { // popup while selecting video card
        switch (action.type) {
          case 'close':
            return { open5: false };
          case 'open':
            return { open5: true };
        }
    }
    const [state5, dispatch5] = React.useReducer(exampleReducer5, {open5: false,})
    const { open5 } = state5

    function openModal5(e){
        dispatch5({ type: 'open' });
        e.preventDefault();
    }

    const [anchorEl, setAnchorEl] = useState(null); //for list of streams drop down menu when you click on move icon
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = (event, index) => {
        setSelectedIndex(index);
        openModal(event);
        setAnchorEl(null);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }
    //

    // var avatars = [ //This is a list that will hold the still image and name of avatar the user has created, needs to come from backend (Wahib)
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
    //     { still: sampleVideo, question: "What is your favourite sport?", album: "default business"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business personal"},
    //     { still: sampleVideo, question: "What is your name?", album: "default business" },
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun personal"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default business"},
    //     { still: sampleVideo, question: "How old are you?", album: "default personal"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
    //     { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
    //     { still: sampleVideo, question: "Where do you live?", album: "default business"},
    //     ];

    // var streams =[// This is a list of all the user streams
    //     { still: sampleVideo, maker: toiaName, streamName: "All Stream", ppl: "8", heart:"5", thumbs: "3"},
    //     { still: sampleVideo, maker: toiaName, streamName: "Professor Stream", ppl: "8", heart:"5", thumbs: "3"},
    //     { still: sampleVideo, maker: toiaName, streamName: "Fun Stream", ppl: "8", heart:"5", thumbs: "3"},
    //     { still: sampleVideo, maker: toiaName, streamName: "Abu Dhabi Stream", ppl: "8", heart:"5", thumbs: "3"},
    // ]

    var settingData = [
        {name: "Nizar Habash", email:"nizar.habash@gmail.com", password:"habash123", language: "English"}
    ]
    // var streamData =[//Holds info on the stream
    //   {name: "Fun Stream", privacy: "Public", language: "English", bio:"This is my fun album"}
    // ]

    const [data, setData] = useState(videoList);//this sets data to the state of the avatars list
    const [displayItem, setDisplayItem] = useState('none')

    let new_p = "15"; //this holds the number of new people
    let new_q = "2"; //this holds the number of new questions

    const searchData = (searchval) => {//search function
        if (!searchval) {
        setData(videoList);//if search is empty show all avatars
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

    const renderStream = (card, index) => {//cards for streams

        let streamSetting;
        if(card.id_stream!=1){
            streamSetting= <div className ="garden-settings-buttons">
            <button onClick={(event)=> {openModal3(event)}} className="stream-settings"><i class="fa fa-cog "></i></button>
            <button onClick ={toggleEye} className="stream-private"><i class={privacy_eye} aria-hidden="true"></i></button>
            </div>;
        }

        return(

            <div className="garden-carousel-card" id={card.id_stream}>
                <img src={sampleVideo} width="170" //stream thumbnail
                />
                {streamSetting}

                <div  onClick={album_page}>
                    <h1 className="t1 garden-font-class-2" //name of user
                    >{toiaName}</h1>
                    <p className="t2 garden-font-class-2" //individual stream name
                    >{card.name}</p>
                </div>
                <br></br>
                <div className="garden-carousel-menu" //stats that appear under stream
                >
                    <p style={{marginRight: 30}}>{card.ppl}&nbsp;<i class="fa fa-users"></i></p>
                    <p style={{marginRight: 14}}>{card.heart}<i class="fa fa-heart"></i></p>
                    <p style={{marginLeft: 15}}>{card.thumbs}&nbsp;<i class="fa fa-thumbs-up"></i></p>

                </div>

            </div>


        )
    };
    let videoPlayback = <video id="playbackVideo" width="496" height="324" autoPlay controls><source src={test_video} type='video/mp4'></source></video>;
    const renderCard = (card, index) => {//cards for videos
        return(
            <div className="row">
                <div onClick={(event)=> {openModal5(event)}} className="column" style={{ backgroundImage: `url(${sampleVideo})`, cursor: `pointer`, backgroundSize: "132px 138.6px"}} //video thumbnail
                />
                <div className="column garden-question">
                    <input className="garden-checkbox" type="checkbox" onClick={(event) => handleClick(event, index)} //checkbox
                    />
                    <h1 className="garden-name garden-font-class-2" //question
                    >{card.question}</h1>
                    

                    <button onClick={()=>edit(card)} className="garden-edit" //trash can
                    ><i class="fa fa-edit"></i></button>
                    <button onClick={(event) => {cardSelected.push(videoList[index].question); openModal(event)}} className="garden-delete" //trash can
                    ><i class="fa fa-trash"></i></button>

                </div>
            </div>
        )
    };

    function handleSelectCurrentStream(currentItemObject,currentPageIndex){

        axios.post(`${env['server-url']}/getStreamVideos`,{
            params:{
                streamID: currentItemObject.item.id
            }
        }).then((res)=>{
            console.log(res.data);
            setVideoList(res.data);

        });
    }

    /*navbar navigation fucntions*/
    function home() {
        history.push({
          pathname: '/',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
        });
    }

    function about() {
        history.push({
          pathname: '/about',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
        });
    }

      function library() {
        history.push({
          pathname: '/library',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
        });
    }

      function garden() {
        history.push({
            pathname: '/mytoia',
            state: {
                toiaName,
                toiaLanguage,
                toiaID
              }
        });
    }

    function logout(){
        //logout function needs to be implemented (wahib)
        history.push({
            pathname: '/',
          });
    }

    /*navigations to pages from buttons*/
    function edit(video) {
        history.push({
          pathname: '/editrecorder',
          state: {
            toiaName,
            toiaLanguage,
            toiaID,
            videoID: video.id_video,
            videoType: video.type,
            question: video.question,
            answer: video.answer
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
    function album_page() {
        history.push({
            pathname: '/stream',
        });
    }

    const handleClick = (event, index) => {//function that populates and depopulates the cardSelected variable and controls visibility of hidden menu
        let isChecked = event.target.checked;
        if (isChecked == true){//checks if a video has been selected, adds to list and makes hidden menu appear
            cardSelected.push(videoList[index].question);
            setDisplayItem('block');
        }else{
            cardSelected.splice(cardSelected.indexOf(videoList[index].question), 1);//else video is being deselected, deletes from list
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

    function save() {//this function saves all changes the user makes to the account settings
        dispatch({ type: 'close' });
    }

    function saveNewStream(e) {//this function saves all changes the user makes to the account settings
        e.preventDefault();

        axios.post(`${env['server-url']}/createNewStream`,{
            params: {
                toiaID,
                newStreamName,
                newStreamPrivacy,
                newStreamBio
            }
        }).then((res)=>{
            setStreamList(res.data);
            dispatch4({ type: 'close' });
        });
    }

    const inlineStyle = {
        modal : {
            height: '100px',
            width: '600px',
        }
    };

    const inlineStyleSetting = {
        modal : {
            height: '70vh',
            width: '50vw',
        }
    };

    const searchText = "Hi"

    // let privacy_eye = "fa fa-eye"
    const [privacy_eye, setPrivacyEye] = useState('fa fa-eye');
    const [stream_privacy, setStreamPrivacy] = useState('Public');

    function toggleEye() {
      if(privacy_eye === "fa fa-eye"){
        setPrivacyEye("fa fa-eye-slash");
        setStreamPrivacy("Private")
        console.log("work toggle eye test")
      }else{
        setPrivacyEye("fa fa-eye");
        setStreamPrivacy("Public")
        console.log("second case toggle eye test")
      }
    }

    return (
        <div className="garden-page">
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
            <Modal //This is the settings pop menu, that shows whenever you delete or move videos
            size='large'
            closeIcon={true}
            style={inlineStyleSetting.modal}
            open={open2}
            onClose={() => dispatch2({ type: 'close' })}
            >
                <Modal.Header className="login_header">
                <h1 className="login_welcome login-opensans-normal">Account Settings</h1>
                <p className="login_blurb login-montserrat-black">Edit the following information about your account</p>
                </Modal.Header>
                <Modal.Content>
                    <div className="garden-settings-name garden-font-class-2" //the name input field
                    >Name: </div>
                    <input
                        className="garden-settings-name_box garden-font-class-2"
                        defaultValue = {settingData[0].name}
                        type={"text"}
                        onChange={e=>(settingData[0].name = e.target.value)}
                    />
                    <div className="garden-settings-email garden-font-class-2" //the email input field
                    >Email: </div>
                    <input
                        className="garden-settings-email_box garden-font-class-2"
                        defaultValue = {settingData[0].email}
                        type={"email"}
                        onChange={e=>(settingData[0].email = e.target.value)}
                    />
                    <div className="garden-settings-pass garden-font-class-2" //the password input field
                    >Password: </div>
                    <input
                        className="garden-settings-pass_box garden-font-class-2"
                        defaultValue = {settingData[0].password}
                        type={"password"}
                        onChange={e=>(settingData[0].password = e.target.value)}
                    />
                    <div className="garden-settings-lang garden-font-class-2" //the language input field
                    >Language: </div>
                    <select className="garden-settings-lang_box garden-font-class-2" onChange={e=>(settingData[0].language = e.target.value)} /*required={true}*/>
                        <option value="" disabled selected hidden>{settingData[0].language}</option>
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
                    <div className="garden-settings-delete" //delete button, function TBD
                    >
                        <h1 className="garden-font-class-2 garden-settings-text">Delete</h1>
                    </div>
                    <div onClick={save} className="garden-settings-save" //saves changes made inaccount settings, function TBD
                    >
                        <h1 className="garden-font-class-2 garden-settings-text">Save</h1>
                    </div>
                </Modal.Content>
            </Modal>

            <Modal //This is the stream settings pop menu
            size='large'
            closeIcon={true}
            style={inlineStyleSetting.modal}
            open={open3}
            onClose={() => dispatch3({ type: 'close' })}
            >
                <Modal.Header className="login_header">
                <h1 className="login_welcome login-opensans-normal">Edit Stream </h1>
                <p className="login_blurb login-montserrat-black">Edit the following information about your stream</p>
                </Modal.Header>
                <Modal.Content>
                    <div className="stream-settings-name garden-font-class-2"  //the name input field
                    >Name: </div>
                    <input
                        className="stream-settings-name_box garden-font-class-2"
                        placeholder="Enter a new stream name"
                        type={"text"}
                        onChange={e=>(setNewStreamName(e.target.value))}
                        required={true}
                    />
                    <div className="stream-settings-email garden-font-class-2"  //the email input field
                    >Privacy: </div>
                    <select className="stream-settings-email_box garden-font-class-2"
                            onChange={e=>(setNewStreamPrivacy(e.target.value))}
                            required={true}>
                      <option value="" disabled selected hidden>{stream_privacy}</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    {/*<input
                        className="stream-settings-email_box garden-font-class-2"
                        defaultValue = {settingData[0].email}
                        type={"email"}
                        onChange={e=>(settingData[0].email = e.target.value)}
                    />*/}

                    <div className="stream-settings-lang garden-font-class-2" //the language input field
                    >Bio: </div>

                <textarea
                    className="stream-settings-lang_box garden-font-class-2"
                    placeholder = "Enter what your new stream will be about"
                    type={"text"}
                    onChange={e=>(setNewStreamBio(e.target.value))}
                    rows="4" cols="50"
                    required={true}
                />
                <div className="stream-photo-upload garden-font-class-2" //delete button, function TBD
                >
                  <form>
                    <label for="img">Select image:</label>
                    <input className= "stream-photo-upload-choose garden-font-class-2" type="file" id="img" name="img" accept="image/*"/>
                    <input className="stream-settings-save garden-font-class-2 stream-settings-text" onClick={saveNewStream} type="submit"/>
                  </form>
                </div>
                    {/* <div className="stream-settings-delete" //delete button, function TBD
                    >
                        <h1 className="garden-font-class-2 stream-settings-text">Discard</h1>
                    </div> */}
                    {/* <div onClick={save} className="stream-settings-save" //saves changes made inaccount settings, function TBD
                    >
                        <h1 className="garden-font-class-2 stream-settings-text">Save</h1>
                    </div> */}
                </Modal.Content>
            </Modal>
            <Modal //This is the stream settings pop menu
            size='large'
            closeIcon={true}
            style={inlineStyleSetting.modal}
            open={open4}
            onClose={() => dispatch4({ type: 'close' })}
            >
                <Modal.Header className="login_header">
                <h1 className="login_welcome login-opensans-normal">Add Stream </h1>
                <p className="login_blurb login-montserrat-black">Add the following information about your stream</p>
                </Modal.Header>
                <Modal.Content>
                    <div className="stream-settings-name garden-font-class-2"  //the name input field
                    >Name: </div>
                    <input
                        className="stream-settings-name_box garden-font-class-2"
                        placeholder="Enter a new stream name"
                        type={"text"}
                        onChange={e=>(setNewStreamName(e.target.value))}
                        required={true}
                    />
                    <div className="stream-settings-email garden-font-class-2"  //the email input field
                    >Privacy: </div>
                    <select className="stream-settings-email_box garden-font-class-2"
                            onChange={e=>(setNewStreamPrivacy(e.target.value))}
                            required={true}>
                      <option value="" disabled selected hidden>Public</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    {/*<input
                        className="stream-settings-email_box garden-font-class-2"
                        defaultValue = {settingData[0].email}
                        type={"email"}
                        onChange={e=>(settingData[0].email = e.target.value)}
                    />*/}

                    <div className="stream-settings-lang garden-font-class-2" //the language input field
                    >Bio: </div>

                <textarea
                    className="stream-settings-lang_box garden-font-class-2"
                    placeholder = "Enter what your new stream will be about"
                    type={"text"}
                    onChange={e=>(setNewStreamBio(e.target.value))}
                    rows="4" cols="50"
                    required={true}
                />
                <div className="stream-photo-upload garden-font-class-2" //delete button, function TBD
                >
                  <form>
                    <label for="img">Select image:</label>
                    <input className= "stream-photo-upload-choose garden-font-class-2" type="file" id="img" name="img" accept="image/*"/>
                    <input className="stream-settings-save garden-font-class-2 stream-settings-text" onClick={saveNewStream} type="submit"/>
                  </form>
                </div>
                    {/* <div className="stream-settings-delete" //delete button, function TBD
                    >
                        <h1 className="garden-font-class-2 stream-settings-text">Discard</h1>
                    </div> */}
                    {/* <div onClick={save} className="stream-settings-save" //saves changes made inaccount settings, function TBD
                    >
                        <h1 className="garden-font-class-2 stream-settings-text">Save</h1>
                    </div> */}
                </Modal.Content>
            </Modal>
            <Modal //this is the new pop up menu

            size='large'
            style={{position: "absolute", height: "80%",width: "70%", top:"2%", alignContent:"center"}}
            open={open5}
            onClose={() => dispatch5({ type: 'close' })}
            >
                <Modal.Header className="modal-header">
                  <div>Video entry </div>
                  </Modal.Header>
                <Modal.Content>
                <div id="typeOfVideo">Video Type: Public</div>
                <div id="questionOfVideo">Question being answered: "Q&A"</div>
                <div id="privacyOfVideo">Privacy Settings: Public</div>
                <div id="divider"></div>
                {videoPlayback}
                {/* <video id="videoRecorded"></video> */}
                <div id="answerCorrection">The answer provided:</div>
                <input
                  className="modal-ans font-class-1"
                  placeholder="Testing"
                  value="Testing"
                  type={"text"}
                  // onChange={setAnswerValue}
                />
                {/* <div contentEditable="true" className="modal-ans font-class-1" onChange={setAnswerValue}>{answerProvided}
                </div> */}
                </Modal.Content>
                <Modal.Actions>
                <Button color='green'>
                    <i class="fa fa-check"></i>
                </Button>
                </Modal.Actions>
            </Modal>
            <div className="nav-heading-bar" //Nav bar
            >
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div onClick={about} className="nav-about_icon app-monsterrat-black nav-deselect">
                    About Us
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black nav-deselect">
                    Talk To TOIA
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black nav-selected">
                    My TOIA
                </div>
                <div onClick={logout}className="nav-login_icon app-monsterrat-black nav-deselect">
                    Logout
                </div>
            </div>
            <div className="section3">
              <h1 className="garden-title garden-font-class-1 " //welcome message
              >Hi {toiaName}</h1>
            {  // {<h4 className="garden-subtitle garden-font-class-3 " //welcome message
              // >Here are your All stream videos!</h4>
            }

            <h1 className="garden-notifications garden-font-class-3 " //welcome message
            >Notifications <h4 style = {{position: "absolute", top: "65.5%", fontWeight: "300"}}>Four new videos added!</h4></h1>
              <button  onClick={(event)=> {openModal2(event)}} className="garden-settings"><i class="fa fa-cog"></i></button>
            </div>
            <div className="section1">

                <h1 className="stream-heading garden-font-class-3 ">My TOIA Streams</h1>

                /*{// <Carousel
                // plugins={[
                //           'clickToChange',
                //           'centered',
                //           {
                //             resolve: slidesToShowPlugin,
                //             options: {
                //              numberOfSlides: 1
                //             }
                //           },
                //       ]}
                //       className="garden-carousel"
                //       >
                //
                //     {streamList.map(renderStream)}
                //
                // </Carousel>
              }*/



                <Carousel itemsToShow={1} showArrows ={false} onChange={handleSelectCurrentStream} >
                  {streamList.map(renderStream)}
                </Carousel>

                <div onClick={(event)=> {openModal4(event)}}><img className="garden-stream" src={addButton} // add stream button
                /></div>
                <h1 className="stream-add-text garden-font-class-3">Add Stream</h1>
              {/*   <h1 className="stream-text garden-font-class-3">Add Stream</h1>
                 <div className="elem-1" //the new question element
                >
                    <p className="elem-text-1 garden-font-class-3" >{new_p}</p>
                    <p className="elem-text-2 garden-font-class-3">New Conversations</p>
                </div>
                <div className="elem-2" //the new question element
                >
                    <p className="elem-text-1 garden-font-class-3" >{new_q}</p>
                    <p className="elem-text-2 garden-font-class-3">New questions!</p>
                </div> */}
                {// previous code for carousel:
                /* //this is the sliding image carousel that holds all the streams I got it from here https://brainhubeu.github.io/react-carousel/docs/gettingStarted
//                 // plugins={[ */
//                 //     'clickToChange',
//                 //     'centered',
//                 //     {
//                 //       resolve: slidesToShowPlugin,
//                 //       options: {
//                 //        numberOfSlides: 1
//                 //       }
//                 //     },
//                 // ]}
//                 // className="garden-carousel"
//                 // >}
                }


            </div>
            <div className="section2">
                <input className="garden-search garden-search-text" type="text" placeholder="&#xF002;   Here are your All Stream videos" onChange={(event) => searchData(event.target.value)} // search bar
                />
                <div className ="garden-grid" // videos
                >
                <div onClick={add}><img className="garden-add" src={addButton} // add video button
                /></div>
                    {videoList.map(renderCard)}
                </div>
                <div className="garden-hidden" style={{display: displayItem}} // hidden menu that appears when video is selected
                >
                    <div onClick={openModal}><img className="garden-trash" src={trashIcon} // trash button
                    /></div>
                    <div>
                        <IconButton // icon buttonm menu I got from material-ui, its a react framework that I used a lot to create things
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                        >
                            <img  className="garden-move_icon" src={moveIcon} //move button
                            />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {streamList.map((option, index) => ( // this is the menu, its a list of the stream names I took form the streams variable
                                <MenuItem selected={index === selectedIndex} onClick={(event) => handleMenuClose(event, index)}>{option.streamName}</MenuItem>
                            ))}
                        </Menu>
                    </div>
                </div>

                <h1 className="video-text garden-font-class-3">Add Video</h1>
            </div>
        </div>
    );

}


export default AvatarGardenPage;
