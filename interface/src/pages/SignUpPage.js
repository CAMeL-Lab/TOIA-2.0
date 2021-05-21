import './App.css';
import './SignUpPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, {useState} from "react";
import submitButton from "../icons/submit-button.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';

function SignUpPage() {

  function exampleReducer( state, action ) {
    switch (action.type) {
      case 'close':
        return { open: false };
      case 'open':
        return { open: true }; 
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

  const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
  const { open } = state

  function openModal(e){
    dispatch({ type: 'open' });
    e.preventDefault();
  }

  function submitHandler(){
    if (pass === cpass){
      history.push({
        pathname: '/garden',
      });
    }else{
      alert('Passwords need to match');
    }
  }

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

  function garden(e) {
    if (isLogin) {
      history.push({
        pathname: '/garden',
      });
    }else{
      openModal(e);
    }
  }

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
    <form className="signup-page" onSubmit={submitHandler}>
      <Modal //this is the new pop up menu
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
      <div className="signup-group">
          <input className="signup-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
          <input
              className="signup-pass1 signup-font-class-1"
              placeholder={"Confirm Password"}
              type={"password"}
              required={true}
              onChange={e=>setCPass(e.target.value)}
          />
          <input
              className="signup-pass signup-font-class-1"
              placeholder={"Create Password"}
              type={"password"}
              required={true}
              onChange={e=>setPass(e.target.value)}
          />
          <div className="signup-language signup-font-class-1 ">Language:</div>
          <select className="signup-lang signup-font-class-1" onChange={e=>setLanguage(e.target.value)} required={true}>
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
          <input
              className="signup-email signup-font-class-1"
              placeholder={"Email"}
              type={"email"}
              required={true}
              onChange={e=>setEmail(e.target.value)}
          />
          <input
              className="signup-lname signup-font-class-1"
              placeholder={"Last Name"}
              type={"text"}
              required={true}
              onChange={e=>setLname(e.target.value)}
          />
          <input
              className="signup-fname signup-font-class-1"
              placeholder={"First Name"}
              type={"text"}
              required={true}
              onChange={e=>setFName(e.target.value)}
          />
          <p className="signup_text signup-font-class-2 signup-animate-enter">Enter the following information to create your TOIA account</p>
          <h1 className="signup-title signup-font-class-3 ">Get Started</h1>
      </div>
      <div className="nav-heading-bar">
          <div onClick={home} className="nav-toia_icon app-opensans-normal">
            TOIA
          </div>
          <div onClick={about} className="nav-about_icon app-monsterrat-black">
            About Us
          </div>
          <div onClick={library} className="nav-talk_icon app-monsterrat-black">
            Talk To TOIA
          </div>
          <div onClick={garden} className="nav-my_icon app-monsterrat-black">
            My TOIA
          </div>
          <div onClick={openModal}className="nav-login_icon app-monsterrat-black">
            Login
          </div>
      </div>
    </form>
  );
}

export default SignUpPage;