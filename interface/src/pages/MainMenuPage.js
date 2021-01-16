import './App.css';
import './MainMenuPage.css';
import React from "react";
import sampleButton from "../icons/sample-button.svg";
import closeButton from "../icons/close-button.svg";
import history from '../services/history';


function MainMenuPage() {
    function close(){
        history.goBack();
    }

    function garden(){
        history.push({
            pathname: '/garden',
        });
    }
    function library(){
        history.push({
            pathname: '/library',
        });
    }

    // function goToPlayer(){
    //     history.push({
    //       pathname: '/player'
    //     });
    // }

    // function goToSettings(){
    //     history.push({
    //       pathname: '/settings'
    //     });
    // }
    
    return (
        <div className="menu-page">
        <div className="menu-group">
            <div onClick={garden}><img className="menu-garden" src={sampleButton} /></div>
            <div onClick={library}><img className="menu-library" src={sampleButton} /></div>
            <div className="menu-text menu-opensans-normal ">Interact With Other Avatars</div>
            <div className="menu-text1 menu-opensans-normal ">Make Your Own Avatar</div>
        </div>
        <div onClick={close}><img className="menu-close_icon" src={closeButton} /></div>
        </div>
    );
}

export default MainMenuPage;