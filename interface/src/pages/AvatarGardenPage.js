import './App.css';
import './AvatarGardenPage.css';
import 'semantic-ui-css/semantic.min.css';
import React, { useState } from 'react';
import Fuse from "fuse.js";
import { Card } from "react-bootstrap";
import addButton from "../icons/add-button.svg";
import menuButton from "../icons/menu-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import settingsButton from "../icons/settings-button.svg";
import history from '../services/history';
import {Menu, Sidebar, Segment } from 'semantic-ui-react';
import axios from 'axios';

function AvatarGardenPage() {

    React.useEffect(() => {
        console.log('wohoo');
        axios.get('http://localhost:3000/getAllAvatars').then((res)=>{
            console.log(res);
        });
       
    });

    var avatars = [ //This is a list that will hold the still image and name of avatar the user has created, needs to come from backend (Wahib)
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "Jane Doe" },
        { still: sampleVideo, name: "Mary Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "Matthew Doe" },
        { still: sampleVideo, name: "Joseph Doe" },
        { still: sampleVideo, name: "Peter Doe" },
        { still: sampleVideo, name: "Paul Doe" },
        { still: sampleVideo, name: "Nizar Doe" },
        { still: sampleVideo, name: "Tyeece Doe" },
        { still: sampleVideo, name: "Daniel Doe" },
        { still: sampleVideo, name: "Goliath Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        ];

    const [visible, setVisible] = React.useState(false);
    const [avatarList, setAvatarList] = React.useState([]);
    const [data, setData] = useState(avatars);//this sets data to the state of the avatars list

    const searchData = (searchval) => {//search function
        if (!searchval) {
        setData(avatars);//if search is empty show all avatars
        return;
        }

        const fuse = new Fuse(data, {
        keys: ["name"], //sets what key will sort through in the avatar list
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


    const renderCard = (card, index) => {
        return(
            <Card key={index} className="garden-box border-0">
                <Card.Img className="garden-still"variant="top" src={card.still}/>
                <Card.Body>
                    <Card.Title className="garden-name">{card.name}</Card.Title>
                    <div className="garden-popup">
                        <button /*onClick={}*/ className="garden-edit">Edit</button> 
                        <button /*onClick={}*/ className="garden-delete">Delete</button>
                        <span onClick={settings}><img className="garden-settings" src={settingsButton} /></span>
                    </div>
                </Card.Body>
            </Card>
        )
    }
    //A delete function, that deletes the specific avatar in aws (Wahib)

    function settings(){
        history.push({
          pathname: '/settings',
        });
    }

    function mainmenu() {
       history.push({
          pathname: '/menu',
        }); 
    }

    function logout(){
        //logout function needs to be implemented (wahib)
        history.push({
            pathname: '/',
          });
    }


    return (
        <div className="garden-page">
            <>
            <Sidebar.Pushable as={Segment}>
                <Sidebar
                    as={Menu}
                    animation='overlay'
                    icon='labeled'
                    onHide={() => setVisible(false)}
                    vertical
                    visible={visible}
                    width='wide'
                >
                    <Menu.Item>
                        <div onClick={mainmenu} className="garden-menu-item">Exit to Main Menu</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={logout} className="garden-menu-item red">Logout</div>
                    </Menu.Item>
                </Sidebar>

                <Sidebar.Pusher dimmed={visible}>
                    <div onClick={settings}><img className="garden-add" src={addButton} /></div>
                    <div className ="garden-grid">
                        {data.map(renderCard)}
                    </div>
                    <input className="garden-search" type="text" placeholder="&#xF002;" onChange={(event) => searchData(event.target.value)}/>
                    <div onClick={() => setVisible(true)}><img className="garden-menu_icon" src={menuButton} /></div>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
            </>
        </div>
    );
}

export default AvatarGardenPage;