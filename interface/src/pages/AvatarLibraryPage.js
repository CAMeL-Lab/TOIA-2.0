import './App.css';
import './AvatarLibraryPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState, useEffect } from 'react';
import Fuse from "fuse.js";
import sampleVideo from "../icons/sample-video.svg";
import submitButton from "../icons/submit-button.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';
import alberto from "../images/alberto.jpeg";
import wahib from "../images/wahib.jpg";
import kertu from "../images/kertu.jpg";
import erin from "../images/erin.jpeg";
import nizar from "../images/nizar.jpg";
import goffredo from "../images/goffredo.jpeg";
import tyeece from "../images/Tyeece.jpg";
import armaan from "../images/armaan.jpg";
import env from './env.json';

function AvatarLibraryPage() {

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


    const [open2, dispatch2] = useState(false);// this is to open the view pop up

    function openModal2(e){
        dispatch2(true);
        e.preventDefault();
    }
    //

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);
    const [isLoggedIn,setLoginState]=useState(false);
    const [allData,setAllData]=useState([]);
    const [searchData,setSearchData]=useState([]);

    const [interactionLanguage,setInteractionLanguage]=useState(null);

    useEffect(() => {
      if(history.location.state!=undefined){
        setLoginState(true);
        setName(history.location.state.toiaName);
        setLanguage(history.location.state.toiaLanguage);
        setTOIAid(history.location.state.toiaID);
      }

      axios.get(`${env['server-url']}/getAllStreams`).then((res)=>{
        setAllData(res.data);
        setSearchData(res.data);
      });

    },[]);

    var input1, input2; //input fields for email and password

    let hLight1 = 2; //variables that hold the index number of the higlighted TOIA streams
    let hLight2 = 1;

    const [viewIndex, setviewIndex] = useState(0); //this hold the index of the avater to be seen in the view pop up

    function goToPlayer(element){

      if(isLoggedIn){
        history.push({
          pathname: '/player',
          state: {
            toiaName,
            toiaLanguage,
            toiaID,
            toiaToTalk: element.id,
            toiaFirstNameToTalk: element.first_name,
            toiaLastNameToTalk: element.last_name,
            streamToTalk: element.id_stream,
            streamNameToTalk: element.name+" stream"
          }
        });
      }else{
        history.push({
          pathname: '/player',
          state: {
            toiaToTalk: element.id,
            toiaFirstNameToTalk: element.first_name,
            toiaLastNameToTalk: element.last_name,
            streamToTalk: element.id_stream,
            streamNameToTalk: element.name+" stream"
          }
        });
      }
    }

    const renderStream = (card, index) => {//cards for streams

      return(
          <div className="garden-carousel-card" id={card.id_stream} onClick={()=>{goToPlayer(card)}}>
              <img src={sampleVideo} width="170" //stream thumbnail
              />
              <div>
                  <h1 className="t1 garden-font-class-2" //name of user
                  >{card.first_name+' '+card.last_name}</h1>
                  <p className="t2 garden-font-class-2" //individual stream name
                  >{card.name + " stream"}</p>
              </div>
              <br></br>
              <div className="garden-carousel-menu" //stats that appear under stream
              >
                  {/* <p style={{marginRight: 30}}>{card.views}&nbsp;<i class="fa fa-users"></i></p>
                  <p style={{marginLeft: 15}}>{card.likes}&nbsp;<i class="fa fa-thumbs-up"></i></p> */}
              </div>
          </div>
      )
    };

    const searchStreams = (searchval) => {//search function
      if (!searchval) {
      setSearchData(allData);//if search is empty show all avatars
      return;
      }

      const fuse = new Fuse(allData, {
        keys: [ // sets criteria for search, allows for user to search for both name and stream name
          'maker',
          {
            name: 'streamName',
            weight: 0.5
          }
        ]
      });

      const result = fuse.search(searchval);//collects the results of those that match the search
      const match = [];
      if (!result.length) {
          setSearchData([]);//if there are no results show nothing
      } else {
          result.forEach(({item}) => {
              match.push(item);
          });
          setSearchData(match);//display all the cards that match the search value
      }
    };

    //login pop up functions
    function myChangeHandler(event){
        event.preventDefault();
        var name = event.target.name;

        switch(name) {
          case "email":
            input1 = event.target.value;
            break;
          case "pass":
            input2 = event.target.value;
            break;
        }
    }

    function submitHandler(e){
      e.preventDefault();

      let params={
        email:input1,
        pwd:input2
      }

      axios.post(`${env['server-url']}/login`,params).then(res=>{
        if(res.data==-1){
            //alert('Email not found');
          alert("Incorrect e-mail address.");
        }else if(res.data==-2){
          alert("Incorrect password");
          // setHasPasswordError(true);
        }else {
          history.push({
            pathname: '/mytoia',
            state: {
              toiaName:res.data.firstName,
              toiaLanguage:res.data.language,
              toiaID: res.data.toia_id
            }
          });
        }
      });
    }

    // Nav bar functions
    function home() {
      if(isLoggedIn){
        history.push({
          pathname: '/',
          state: {
            toiaName,
            toiaLanguage,
            toiaID
          }
        });
      }else{
        history.push({
          pathname: '/',
        });
      }
    }

    function about() {
      if(isLoggedIn){
          history.push({
          pathname: '/about',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
          }
          });
      }else{
          history.push({
          pathname: '/about',
          });
      }
    }

    function library() {
      if(isLoggedIn){
          history.push({
          pathname: '/library',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
          }
          });
      }else{
          history.push({
          pathname: '/library',
          });
      }
    }

    function garden(e) {
      if (isLoggedIn) {
          history.push({
          pathname: '/mytoia',
          state: {
              toiaName,
              toiaLanguage,
              toiaID
              }
          });
      }else{
          openModal(e);
      }
    }

    function logout(){
        //logout function needs to be implemented (wahib)
        history.push({
          pathname: '/',
        });
      }

     // navigation functions from elements in webpage

     function signup(){
        history.push({
          pathname: '/signup',
        });
      }

     const inlineStyle = {
        modal : {
            height: '560px',
            width: '600px',
        }
      };

    return (
        <div className="library-page">
            <Modal //this is the login pop up menu
                size='large'
                style={inlineStyle.modal}
                open={open}
                onClose={() => dispatch({ type: 'close' })}
            >
                <Modal.Header className="login_header">
                <h1 className="login_welcome login-opensans-normal">Welcome Back</h1>
                <p className="login_blurb login-montserrat-black">Enter the following information to login to your TOIA account</p>
                </Modal.Header>
                <Modal.Content>
                <form className="login_popup" onSubmit={submitHandler}>
                    <input
                    className="login_email login-font-class-1"
                    placeholder={"Email"}
                    type={"email"}
                    required={true}
                    onChange={myChangeHandler}
                    name={"email"}
                    />
                    <input
                    className="login_pass login-font-class-1"
                    placeholder={"Password"}
                    type={"password"}
                    required={true}
                    onChange={myChangeHandler}
                    name={"pass"}
                    />
                    <input className="login_button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
                    <div className="login_text login-montserrat-black" onClick={signup}>Don't have an Account? Sign Up</div>
                </form>
                </Modal.Content>
             </Modal>
             <Modal //this is the view pop up menu
                size='large'
                style={inlineStyle.modal}
                open={open2}
                onClose={() => dispatch2(false)}
            >
                <Modal.Content>
                {/* <img className="library-view-img" src={allData[viewIndex].still}/> */}
                  <div className="library-view-menu" //the stats that appear under the image
                  >
                      {/* <p style={{marginRight: 52}}>{allData[viewIndex].views}&nbsp;<i class="fa fa-users"></i></p>
                      <p style={{marginLeft: 26}}>{allData[viewIndex].likes}&nbsp;<i class="fa fa-thumbs-up"></i></p> */}
                  </div>
                  {/* <h1 className="library-view-text" style={{top: '6%'}}>{allData[viewIndex].maker}</h1>
                  <h2 className="library-view-text text" style={{top: '16%'}}>{allData[viewIndex].streamName}</h2>
                  <p className="library-view-text text" style={{top: '31%'}}>{allData[viewIndex].language}</p>
                  <p className="library-view-text text" style={{top: '42%'}}>{allData[viewIndex].bio}</p> */}
                  <select className="library-lang-box" onChange={e=>(setInteractionLanguage(e.target.value))}>
                    <option value="" disabled selected hidden>What language would you like to speak in..</option>
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
                  <div className="library-view-button"><img src={submitButton}/></div>
                </Modal.Content>
             </Modal>
             <div className="nav-heading-bar" //nav bar
             >
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div onClick={about} className="nav-about_icon app-monsterrat-black nav-deselect">
                    About Us
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black nav-selected">
                    Talk To TOIA
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black nav-deselect">
                    My TOIA
                </div>
                <div onClick={isLoggedIn ? logout : openModal}className="nav-login_icon app-monsterrat-black nav-deselect" //depending on whter user is logged in or not, the button will change from login to logout
                >
                   {isLoggedIn ? 'Logout' : 'Login'}
                </div>
            </div>


            <input className="library-search" type="text" placeholder="&#xF002;" onChange={(event) => searchStreams(event.target.value)}/>
            <div className ="library-grid" //videos
            >
                {allData.map(renderStream)}
            </div>
        </div>
    );
}

export default AvatarLibraryPage;

  /*
    const [avatarList, setAvatarList] = React.useState([]);
    const [avatarCards, setAvatarCards] = React.useState('');

    React.useEffect(() => {
        axios.get('http://localhost:3000/getAllAvatars').then((res)=>{
            setAvatarList(res.data);
            setAvatarCards(avatarList.map(renderCard));
        });
    });*/


  /*  <div className="library-highlights">
    <div className="row" // highlighted streams
    >
      <div onClick={(event) => {setviewIndex(hLight1); openModal2(event)}} className="library-box border-0 column">


      </div>
      <div onClick={(event) => {setviewIndex(hLight2); openModal2(event)}} className="library-box border-0 column">

      </div>
    </div>
  </div>
  <div className="library-random">
    <h1 className="library-text">Match me with a random TOIA</h1>
  </div> */
