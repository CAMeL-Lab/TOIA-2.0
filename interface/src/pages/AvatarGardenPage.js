import './App.css';
import './AvatarGardenPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from 'react';
import Fuse from "fuse.js";
import addButton from "../icons/add-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import history from '../services/history';
import axios from 'axios';

function AvatarGardenPage() {

    const [avatarName, setName] = useState(null);
    const [avatarLanguage, setLanguage] = useState(null);
    const [avatarID, setAvatarID] = useState(null);

    React.useEffect(() => {
        setName(history.location.state.avatarName);
        setLanguage(history.location.state.avatarLanguage);
        setAvatarID(history.location.state.avatarID);
       
    });

    var avatars = [ //This is a list that will hold the still image and name of avatar the user has created, needs to come from backend (Wahib)
        { still: sampleVideo, question: "What's a usual business day like?", album: "default business"},
        { still: sampleVideo, question: "What are your hobbies?", album: "default personal"},
        { still: sampleVideo, question: "What sports do you like?", album: "default fun"},
        ];

    var albums =[ // this is a lst of all the albums
        {name: "Default", value: "default"},
        {name: "Business", value: "business"},
        {name: "Personal", value: "personal"},
        {name: "Fun", value: "fun"},
        ];

    const [data, setData] = useState(avatars);//this sets data to the state of the avatars list

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

    const sortData = (sortval) => {//search function
        setData(avatars);//set to all so the sort goes over the entire list

        const fuse = new Fuse(data, {
        keys: ["album"], //sets what key will sort through in the avatar list
        });

        const result1 = fuse.search(sortval);//collects the results of those that match the search
        const match1 = [];
        if (!result1.length) {
            setData([]);//if there are no results show nothing
        } else {
            result1.forEach(({item}) => {
                match1.push(item);
            });
            setData(match1);//display all the cards that match the search value
        }
    };


    const renderCard = (card, index) => {
        return(
            <div className="garden-box" style={{ backgroundImage: `url(${card.still})`}}>
                <h1 className="garden-name" >{card.question}</h1>
                <div className="garden-popup">
                        <button onClick={edit} className="garden-edit">Edit</button> 
                        <button /*onClick={}*/ className="garden-delete">Delete</button>
                </div>
            </div>
        )
    }
    //A delete function, that deletes the specific avatar in aws (Wahib)
    
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

    function edit() {
        history.push({
          pathname: '/editrecorder',
        });
    }

    function add() {
        history.push({
            pathname: '/recorder',
            state: {
                avatarName,
                avatarLanguage,
                avatarID
            }
        });
    }


    return (
        <div className="garden-page">
            <div className="nav-heading-bar">
                <div onClick={home} className="nav-toia_icon app-opensans-normal">
                    TOIA
                </div>
                <div className="nav-about_icon app-monsterrat-black nav-deselect">
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
            <input className="garden-search" type="text" placeholder="&#xF002;" onChange={(event) => searchData(event.target.value)}/>
            <select className="garden-sort" onChange={e=>sortData(e.target.value)} required={true}>
                <option value="" disabled selected hidden>Select Album Category...</option>
                {albums.map(album =>
                    <option value={album.value}>{album.name}</option>
                 )};
          </select>
            <div className ="garden-grid">
                {data.map(renderCard)}
            </div>
            <div onClick={add}><img className="garden-add" src={addButton} /></div>
        </div>
    );
}

export default AvatarGardenPage;