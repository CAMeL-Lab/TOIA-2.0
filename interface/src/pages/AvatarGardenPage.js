import './App.css';
import './AvatarGardenPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from 'react';
import Fuse from "fuse.js";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import addButton from "../icons/add-button.svg";
import arrow from "../icons/arrow-button.svg";
import album from "../icons/album-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import moveIcon from "../icons/move-button.svg";
import trashIcon from "../icons/trash-button.svg";
import history from '../services/history';
import {Modal, Button } from 'semantic-ui-react';
import axios from 'axios';

var cardSelected = [];//the videos selected to be edit or deleted

function AvatarGardenPage() {

    // React.useEffect(() => {
    //     console.log('wohoo');
    //     axios.get('http://localhost:3000/getAllAvatars').then((res)=>{
    //         console.log(res);
    //     });
       
    // });

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

    const [anchorEl, setAnchorEl] = useState(null);
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

    var avatars = [ //This is a list that will hold the still image and name of avatar the user has created, needs to come from backend (Wahib)
        { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
        { still: sampleVideo, question: "What is your favourite sport?", album: "default business"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default personal"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business personal"},
        { still: sampleVideo, question: "What is your name?", album: "default business" },
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun personal"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default business"},
        { still: sampleVideo, question: "How old are you?", album: "default personal"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.", album: "default fun"},
        { still: sampleVideo, question: "This text serves as a placeholder for a question.This text serves as a placeholder for a question.This text serves as a placeholder for a question.", album: "default business"},
        { still: sampleVideo, question: "Where do you live?", album: "default business"},
        ];

    var albums =[ // this is a lst of all the albums
        {name: "Default", value: "default"},
        {name: "Business", value: "business"},
        {name: "Personal", value: "personal"},
        {name: "Fun", value: "fun"},
        ];

    const [data, setData] = useState(avatars);//this sets data to the state of the avatars list
    const [displayItem, setDisplayItem] = useState('none')
    let name = "Jane"; //this holds the name of user
    let new_p = "15"; //this holds the number of new people
    let new_q = "10"; //this holds the number of new questions

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

    const sortData = (sortval) => {//sort function

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
                        <button onClick={(event) => {cardSelected.push(avatars[index].question); openModal(event)}} className="garden-delete">Delete</button>
                        <input type="checkbox" onClick={(event) => handleClick(event, index)}/>
                </div>
            </div>
        )
    }
    //A delete function, that deletes the specific video in aws (Wahib)
    
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
        });
    }

    function album_page() {
        history.push({
            pathname: '/settings',
        });
    }

    const handleClick = (event, index) => {
        let isChecked = event.target.checked;
        if (isChecked == true){
            cardSelected.push(avatars[index].question);
            setDisplayItem('block');
        }else{
            cardSelected.splice(cardSelected.indexOf(avatars[index].question), 1);
            if (cardSelected.length == 0){
                setDisplayItem('none');
            }
        }
    }

    function groupSelect() {
        if (selectedIndex == null){ //test if function call is for delete
            dispatch({ type: 'close' });
            //return cardSelected as the videos to be group deleted (Wahib)
        } else {
            dispatch({ type: 'close' });
            //return albums[selectedIndex].value and cardSelected as videos to move to slected album (Wahib)
            setSelectedIndex(null);
        }  
    }

    const inlineStyle = {
        modal : {
            height: '100px',
            width: '600px',
        }
    };

    return (
        <div className="garden-page">
            <Modal //this is the new pop up menu
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
            <div className="section1">
                <h1 className="garden-title garden-font-class-3 ">Hi {name}</h1>            
                <p className="garden-text garden-font-class-2 garden-animate-enter">Edit or add the following information about your TOIA</p>
                <div className="elem-1">
                    <p className="elem-text-1 garden-font-class-3" >{new_p}</p>
                    <p className="elem-text-2 garden-font-class-3">new people talked to your TOIA</p>
                </div>
                <div onClick={album_page} className="elem-2">
                    <div><img className="elem-img1" src={album}/></div>
                    <p className="elem-text-3 garden-font-class-3">ALBUMS</p>
                </div>
                <div className="elem-3">
                    <p className="elem-text-4 garden-font-class-3" >{new_q}</p>
                    <p className="elem-text-5 garden-font-class-3">new questions</p>
                    <div><img className="elem-img2 bounce" src={arrow}/></div>
                </div>
                
               
            </div>
            <div className="section2">
                <input className="garden-search" type="text" placeholder="&#xF002;" onChange={(event) => searchData(event.target.value)}/>
                <select className="garden-sort" onChange={e=>{setData(avatars); sortData(e.target.value)}} required={true}>
                    <option value="" disabled selected hidden>Select Album Category...</option>
                    {albums.map(album =>
                        <option value={album.value}>{album.name}</option>
                    )};
                </select>
                <div className ="garden-grid">
                    {data.map(renderCard)}
                </div>
                <div className="garden-checkbox" style={{display: displayItem}} >
                    <div>
                        <IconButton
                            className="garden-move"
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                        >
                            <img  className="garden-move_icon" src={moveIcon} />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {albums.map((option, index) => (
                                <MenuItem selected={index === selectedIndex} onClick={(event) => handleMenuClose(event, index)}>{option.name}</MenuItem>
                            ))}
                        </Menu>
                    </div>
                    <div onClick={openModal}><img className="garden-trash" src={trashIcon} /></div>
                </div>
                <div onClick={add}><img className="garden-add" src={addButton} /></div>
            </div>
        </div>
    );
}

export default AvatarGardenPage;