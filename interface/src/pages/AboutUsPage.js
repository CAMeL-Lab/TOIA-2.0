import './App.css';
import './AboutUsPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from "react";
import submitButton from "../icons/submit-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';


function AvatarViewPage() {

    /*functions in charge of opening and closing the various pop up menus*/  
    const [open, dispatch] = useState(false);

    function openModal(e){
        dispatch(true);
        e.preventDefault();
    }

    let isLogin = false;//boolean to show whehter user is logged in or not
    var input1, input2;//holds email and pass from popup

    var team =[// This is a list of all members names and their accompanying pictures
        { still: sampleVideo, member: "Nizar H."},
        { still: sampleVideo, member: "Wahib K."},
        { still: sampleVideo, member: "Alberto C."},
        { still: sampleVideo, member: "Kertu K."},
        { still: sampleVideo, member: "Goffredo P."},
        { still: sampleVideo, member: "Erin C."},
        { still: sampleVideo, member: "Tyeece H."},
    ]

    const renderTeam = (card, index) => {//cards for members
        return(
            <div className="about-box border-0">
                <img src={card.still} width="150" //person thumbnail
                />
                <div>
                    <h1 className="about-name" //name of person
                    >{card.member}</h1> 
                </div>
            </div>
        )
    };
    /*navbar functions*/
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
    
      function garden(e) {
        if (isLogin) {
          history.push({
            pathname: '/garden',
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
     //

     /*login popup functions*/
     function signup(){
        history.push({
          pathname: '/signup',
        });
      }

    function submitHandler1(){
        history.push({
            pathname: '/garden',
        });
    }
    const inlineStyle = {
        modal : {
            height: '560px',
            width: '600px',
        }
      };
     
    //a function will be needed to send input5 to database (wahib)
    
    return (
        <div className="about-page">
            <Modal //this is the new pop up menu
                size='large'
                style={inlineStyle.modal}
                open={open} 
                onClose={() => dispatch(false)}
            >
                    <Modal.Header className="login_header">
                    <h1 className="login_welcome login-opensans-normal">Welcome Back</h1>
                    <p className="login_blurb login-montserrat-black">Enter the following information to login to your TOIA account</p>
                    </Modal.Header>

                    <Modal.Content>
                    <form className="login_popup" onSubmit={submitHandler1}>
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
                        <div className="login_text login-montserrat-black" onClick={signup}>Don't have an Account? Sign Up</div>
                    </form>
                    </Modal.Content>
            </Modal>
            <div className="nav-heading-bar">
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div className="nav-about_icon app-monsterrat-black nav-selected">
                    About Us
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black ">
                    Talk To TOIA
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black ">
                    My TOIA
                </div>
                <div onClick={isLogin ? logout : openModal}className="nav-login_icon app-monsterrat-black">
                   {isLogin ? 'Logout' : 'Login'}
                </div>
            </div>
            <h1 className="about-heading">Meet The Team</h1>
            <p className="about-text">The collection of researchers, both graduate and undegraduate, designers 
                and intelligent minds that came together to make TOIA possible </p>
            <div className ="about-grid" //videos
            >
                {team.map(renderTeam)}
            </div>
            
        </div>
    );
}

export default AvatarViewPage;