import './App.css';
import './AvatarLibraryPage.css';
import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import Fuse from "fuse.js";
import { Card } from "react-bootstrap";
import sampleVideo from "../icons/sample-video.svg";
import submitButton from "../icons/submit-button.svg";
import history from '../services/history';
import {Modal} from 'semantic-ui-react';
import axios from 'axios';

function AvatarLibraryPage() {
    
    function exampleReducer( state, action ) {
        switch (action.type) {
          case 'close':
            return { open: false };
          case 'open':
            return { open: true }; 
        }
    }
    
    
    const [avatarList, setAvatarList] = React.useState([]);
    const [avatarCards, setAvatarCards] = React.useState(''); 
    let isLogin = false;
    var input1, input2;

    React.useEffect(() => {
        axios.get('http://localhost:3000/getAllAvatars').then((res)=>{
            setAvatarList(res.data);
            setAvatarCards(avatarList.map(renderCard));
        });
    });

    const [state, dispatch] = React.useReducer(exampleReducer, {open: false,})
    const { open } = state

    function openModal(e){
        dispatch({ type: 'open' });
        e.preventDefault();
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

    function submitHandler(){
        history.push({
            pathname: '/garden',
        });
    }
    const renderCard = (avatar) => {
        return(
            <Card onClick={()=>view(avatar)} key={avatar} className="library-box border-0">
                <Card.Img className="library-still"variant="top" src={sampleVideo}/>
                <Card.Body>
                    <Card.Title className="library-name">{avatar[0]}</Card.Title>
                </Card.Body>
            </Card>
        )
    }
    //A delete function, that deletes the specific avatar in aws (Wahib)

    function view(avatar){
        history.push({
          pathname: '/view',
          state: {
              id_avatar: avatar[1],
              name: avatar[0]
          }
        });
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
             <div className="nav-heading-bar">
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div className="nav-about_icon app-monsterrat-black nav-deselect">
                    About Us
                </div>
                <div onClick={library} className="nav-talk_icon app-monsterrat-black nav-selected">
                    Talk To TOIA
                </div>
                <div onClick={garden} className="nav-my_icon app-monsterrat-black nav-deselect">
                    My TOIA
                </div>
                <div onClick={isLogin ? logout : openModal}className="nav-login_icon app-monsterrat-black nav-deselect">
                   {isLogin ? 'Logout' : 'Login'}
                </div>
            </div>
            <input className="library-search" type="text" placeholder="&#xF002;" /*onKeyUp={}*//>
            <div className ="library-grid">
                {avatarCards}
            </div>
        </div>
    );
}

export default AvatarLibraryPage;