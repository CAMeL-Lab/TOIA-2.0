import {Modal} from 'semantic-ui-react';
import React from "react";
import {NotificationManager} from "react-notifications";
import axios from 'axios';
import submitButton from "../icons/submit-button.svg";

import i18n from "i18next";
import { useTranslation } from "react-i18next";

//toiaName = null, props.toiaID = null, props.toiaLanguage = null, props.isLoggedIn = false, props.history = null

function NavBar(props) {

    const { t } = useTranslation();

    function exampleReducer( state, action ) {
        switch (action.type) {
            case 'open':
                return { 
                  open: true 
                };
            case 'close':
            default:
                return { 
                open: false 
                };

        }
      }

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,});
    
    const { open } = state;

    var input1, input2; //these hold all the user login data

    function openModal(e){
        dispatch({ type: 'open' });
        e.preventDefault();
    }

	function home() {
        if(props.isLoggedIn){
          props.history.push({
            pathname: '/',
            state: {
              toiaName: props.toiaName,
              toiaLanguage: props.toiaLanguage,
              toiaID: props.toiaID
            }
          });
        }else{
          props.history.push({
            pathname: '/',
          });
        }
    }

    function about() {
        if(props.isLoggedIn){
            props.history.push({
            pathname: '/about',
            state: {
                toiaName: props.toiaName,
                toiaLanguage: props.toiaLanguage,
                toiaID: props.toiaID
            }
            });
        }else{
            props.history.push({
            pathname: '/about',
            });
        }
    }

    function library() {
        if(props.isLoggedIn){
            props.history.push({
            pathname: '/library',
            state: {
                toiaName: props.toiaName,
                toiaLanguage: props.toiaLanguage,
                toiaID: props.toiaID
            }
            });
        }else{
            props.history.push({
            pathname: '/library',
            });
        }
    }

    function garden(e) {
        if (props.isLoggedIn) {
            props.history.push({
            pathname: '/mytoia',
            state: {
                toiaName: props.toiaName,
                toiaLanguage: props.toiaLanguage,
                toiaID: props.toiaID
                }
            });
        }else{
            openModal(e);
        }
    }

    function logout(){
        props.history.push({
            pathname: '/'
        });
    }
     //

     /*login popup functions*/
    function signup(){
        props.history.push({
            pathname: '/signup',
        });
    }

    function switch_lang(e){
     // i18n.changeLanguage(props.toiaLanguage);
     console.log("Language changed:", i18n.language);
    if(i18n.language == "en"){
      i18n.changeLanguage("fr");
    } else if (i18n.language == "fr"){
      i18n.changeLanguage("ar");
    } else if (i18n.language == "ar"){
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("en");
    }
  }

    function submitHandler(e){
        e.preventDefault();

        let params={
            email:input1,
            pwd:input2
        }

        axios.post(`/api/login`,params).then(res=>{
            if(res.data==-1){
                //alert('Email not found');
                NotificationManager.error("Incorrect e-mail address.");
            }else if(res.data==-2){
                NotificationManager.error("Incorrect password.");
            }else {
                console.log(res.data);
                props.history.push({
                    pathname:'mytoia',
                    state: {
                    toiaName:res.data.firstName,
                    toiaLanguage:res.data.language,
                    toiaID: res.data.toia_id
                    }
                });
            }
        });
    }

    const inlineStyle = {
        modal : {
            height: '560px',
            width: '600px',
        }
      };

    function login_modal(){
        return (
            <Modal //this is the new pop up menu
                size='large'
                style={inlineStyle.modal}
                open={open}
                onClose={() => dispatch({ type: 'close' })}
            >
                    <Modal.Header className="login_header">
                    <h1 className="login_welcome login-opensans-normal">{t("nav_welcome_back")}</h1>
                    <p className="login_blurb login-montserrat-black">{t("nav_login_request")}</p>
                    </Modal.Header>

                    <Modal.Content>
                    <form className="login_popup" onSubmit={submitHandler}>
                        <input
                        className="login_email login-font-class-1"
                        placeholder={"Email"}
                        type={"email"}
                        required={true}
                        onChange={(e)=>(input1 = e.target.value)}
                        name={"email"}
                        />
                        <input
                        className="login_pass login-font-class-1"
                        placeholder={"Password"}
                        type={"password"}
                        required={true}
                        onChange={(e)=>(input2 = e.target.value)}
                        name={"pass"}
                        />
                        <input className="login_button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
                        <div className="login_text login-montserrat-black" onClick={signup}>{t("nav_signup_request")}</div>
                    </form>
                    </Modal.Content>
            </Modal>
            );
    }

    return (
    <div className="top-nav-bar">
    
            { props.showLoginModal ? login_modal() : ''}

            <div className="nav-heading-bar">
                <div class="nav-dropdown">
                    <button class="nav-dropbtn">EN</button>
                    <div class="nav-dropdown-content">
                        <a href="#">EN</a>
                        <a href="#">AR</a>
                        <a href="#">SP</a>
                        <a href="#">FR</a>
                    </div>
                </div>
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    {t("nav_toia")}
                </div>
                <div onClick={about} className="nav-about_icon app-monsterrat-black">
                    {t("nav_about_us")}
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black ">
                    {t("nav_talk_to_toia")}
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black ">
                    {t("nav_my_toia")}
                </div>
                <div onClick={switch_lang} className="nav-my_icon app-monsterrat-black" >
                  Switch
                </div>
                <div onClick={props.isLoggedIn ? logout : openModal} className="nav-login_icon app-monsterrat-black">
                   {props.isLoggedIn ? t("nav_logout") : t("nav_login")}
                </div>
            </div>
        </div>
            );

}



export default NavBar;