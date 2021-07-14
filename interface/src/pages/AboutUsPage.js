import './App.css';
import './AboutUsPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState, useEffect } from "react";
import submitButton from "../icons/submit-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import alberto from "../images/alberto.jpeg";
import wahib from "../images/wahib.jpg";
import kertu from "../images/kertu.jpg";
import erin from "../images/erin.jpeg";
import nizar from "../images/nizar.jpg";
import goffredo from "../images/goffredo.jpeg";
import tyeece from "../images/Tyeece.jpg";
import armaan from "../images/armaan.jpg";
import nyuad from "../images/nyuad-rb.png";
import camel from "../images/camel.png";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import sigDail from '../pdf/SIGDIAL_2021_TOIA_camera_ready_.pdf'
import axios from 'axios';
import env from './env.json';


function AvatarViewPage() {

    /*functions in charge of opening and closing the various pop up menus*/
    const [open, dispatch] = useState(false);

    function openModal(e){
        dispatch(true);
        e.preventDefault();
    }

    const [toiaName, setName] = useState(null);
    const [toiaLanguage, setLanguage] = useState(null);
    const [toiaID, setTOIAid] = useState(null);
    const [isLoggedIn,setLoginState]=useState(false);

    var input1, input2;//holds email and pass from popup

    useEffect(() => {
        if(history.location.state!=undefined){
          setLoginState(true);
          setName(history.location.state.toiaName);
          setLanguage(history.location.state.toiaLanguage);
          setTOIAid(history.location.state.toiaID);
        }
    },[]);

    var team =[// This is a list of all members names and their accompanying pictures

        { still: alberto, member: "Alberto C."},
        { still: tyeece, member: "Tyeece H."},
        { still: wahib, member: "Wahib K."},
        { still: kertu, member: "Kertu K."},
        { still: armaan, member: "Armaan A."},
        { still: goffredo, member: "Goffredo P."},
        { still: erin, member: "Erin C."},
        { still: nizar, member: "Nizar H."},

    ]

    const renderTeam = (card, index) => {//cards for members
        return(
            <div className="about-box border-0">
                <img src={card.still} className = "image-sizing" //person thumbnail
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
        history.push({
            pathname: '/'
        });
    }
     //

     /*login popup functions*/
    function signup(){
        history.push({
            pathname: '/signup',
        });
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
                alert("Incorrect password.");
            }else {
                console.log(res.data);
                history.push({
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
                        <div className="login_text login-montserrat-black" onClick={signup}>Don't have an Account? Sign Up</div>
                    </form>
                    </Modal.Content>
            </Modal>
            <div className="nav-heading-bar">
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div onClick={about} className="nav-about_icon app-monsterrat-black nav-selected">
                    About Us
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black ">
                    Talk To TOIA
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black ">
                    My TOIA
                </div>
                <div onClick={isLoggedIn ? logout : openModal} className="nav-login_icon app-monsterrat-black">
                   {isLoggedIn ? 'Logout' : 'Login'}
                </div>
            </div>
            <div className = "about-team">
            <h1 className="about-heading">Meet The Team</h1>
            <p className="about-text">The collection of researchers, both graduate and undegraduate, designers
                and intelligent minds that came together to make TOIA possible </p>
            <div className ="about-grid" //videos
            >
                {team.map(renderTeam)}
            </div>
            </div>

            <div className = "logos">
            <a href="https://nyuad.nyu.edu/en/"><img src={nyuad} className = "nyuadImage"/></a>
            <a href="https://github.com/nizarhabash1/TOIA-NYUAD"><i className="fa fa-github gitImage"></i></a>
            <a href="https://nyuad.nyu.edu/en/research/faculty-labs-and-projects/computational-approaches-to-modeling-language-lab.html"><img src={camel} className = "camelImage"/></a>
            </div>


            <div className = "publications">
            <p className="publication-links">Publication Links </p>
            <ul>
                <li>
                Alberto Chierici, Tyeece Hensley, Wahib Kamran, Kertu Koss, Armaan Agrawal, Erin Collins, Goffredo Puccetti and Nizar Habash, A Cloud-based User-Centered Time-Offset Interaction Application,
                SIGdial, April 2021 <a href={sigDail}>[PDF]</a>

                </li>
                <li >
                Nizar Habash and Alberto Chierchi, A View From the Crowd: Evaluation Challenges for Time-Offset Interaction Applications,
                Association for Computational Linguistics, April 2021, <a href="https://www.aclweb.org/anthology/2021.humeval-1.9.pdf">[PDF]</a>
                <a href="https://www.aclweb.org/anthology/2021.humeval-1.9.bib">[BIB]</a>
                </li>
                <li>
                Alberto Chierici, Nizar Habash, Margarita Bicec, The Margarita Dialogue Corpus: A Data Set for Time-Offset Interactions and Unstructured Dialogue Systems,
                Proceedings of the 12th Language Resources and Evaluation Conference, May 2020, <a href="https://www.aclweb.org/anthology/2020.lrec-1.60.pdf">[PDF]</a>
                <a href="https://www.aclweb.org/anthology/2020.lrec-1.60.bib">[BIB]</a>
                </li>
                <li>
                Dana Abu Ali, Muaz Ahmad, Hayat Al Hassan, Paula Dozsa, Ming Hu, Jose Varias, Nizar Habash, A Bilingual Interactive Human Avatar Dialogue System,
                Proceedings of the 19th Annual SIGdial Meeting on Discourse and Dialogue, July 2018, <a href="https://www.aclweb.org/anthology/W18-5027.pdf">[PDF]</a>
                <a href="https://www.aclweb.org/anthology/W18-5027.bib">[BIB]</a>
                </li>
            </ul>

            </div>

        </div>


    );
}

export default AvatarViewPage;
