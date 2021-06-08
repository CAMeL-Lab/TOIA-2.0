import './App.css';
import './AvatarGardenPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from 'react';
import Fuse from "fuse.js";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import addButton from "../icons/add-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import moveIcon from "../icons/move-button.svg";
import trashIcon from "../icons/trash-button.svg";
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
import Carousel,  { slidesToShowPlugin } from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';
import axios from 'axios';

var cardSelected = [];//the videos selected to be edited or deleted

function AvatarGardenPage() {

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);
    const [videoList,setVideoList]=useState([]);
    const [streamList,setStreamList]=useState([]);

    //sample video entry: {question:What is your name?, stream: "fun business"}

    React.useEffect(() => {
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);

        axios.post('http://localhost:3000/getUserVideos',{
            params:{
                toiaID: history.location.state.toiaID
            }
        }).then((res)=>{
            setVideoList(res.data);

            axios.post('http://localhost:3000/getUserStreams',{
                params:{
                    toiaID: history.location.state.toiaID
                }
            }).then((res)=>{
                setStreamList(res.data);
                console.log(res.data);
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
        return(
            <div className="garden-carousel-card">
                <img src={sampleVideo} width="170" //stream thumbnail
                />
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

    const renderCard = (card, index) => {//cards for videos
        console.log(card);
        return(
            <div className="row">
                <div onClick={()=>edit(card)} className="column" style={{ backgroundImage: `url(${sampleVideo})`, cursor: `pointer`}} //video thumbnail
                />
                <div className="column garden-question">
                    <input className="garden-checkbox" type="checkbox" onClick={(event) => handleClick(event, index)} //checkbox
                    /> 
                    <h1 className="garden-name garden-font-class-2" //question
                    >{card.question}</h1>
                    <button onClick={(event) => {cardSelected.push(videoList[index].question); openModal(event)}} className="garden-delete" //trash can
                    ><i class="fa fa-trash"></i></button>
                    
                </div>
            </div>
        )
    };
    
    /*navbar navigation fucntions*/
    function home() {
        history.push({
          pathname: '/',
        });
    }

    function about() {
        history.push({
          pathname: '/about',
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
                <p className="login_blurb login-montserrat-black">Edit the follwoing information about your account</p>
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
            <div className="section1">
                <h1 className="garden-title garden-font-class-3 " //welcome message
                >Welcome Back {toiaName}</h1>
                <h1 className="stream-heading garden-font-class-3 ">My TOIA streams</h1>
                <button  onClick={(event)=> {openModal2(event)}} className="garden-settings"><i class="fa fa-cog"></i></button>
                <Carousel //this is the sliding image carousel that holds all the streams I got it from here https://brainhubeu.github.io/react-carousel/docs/gettingStarted
                plugins={[
                    'clickToChange',
                    'centered',
                    {
                      resolve: slidesToShowPlugin,
                      options: {
                       numberOfSlides: 1.5
                      }
                    },
                ]}
                className="garden-carousel"
                >
                    {streamList.map(renderStream)}
                </Carousel>
                <div onClick={album_page}><img className="garden-stream" src={addButton} // add stream button
                /></div>
                <h1 className="stream-text garden-font-class-3">Add Stream</h1>
                {/* <div className="elem-1" //the new question element
                >
                    <p className="elem-text-1 garden-font-class-3" >{new_p}</p>
                    <p className="elem-text-2 garden-font-class-3">New Conversations</p>
                </div>
                <div className="elem-2" //the new question element
                >
                    <p className="elem-text-1 garden-font-class-3" >{new_q}</p>
                    <p className="elem-text-2 garden-font-class-3">New questions!</p>
                </div> */}
            </div>
            <div className="section2">
                <input className="garden-search" type="text" placeholder="&#xF002;" onChange={(event) => searchData(event.target.value)} // search bar
                />
                <div className ="garden-grid" // videos 
                >
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
                <div onClick={add}><img className="garden-add" src={addButton} // add video button
                /></div>
                <h1 className="video-text garden-font-class-3">Add Video</h1>
            </div>
        </div>
    );
}

export default AvatarGardenPage;