import './App.css';
import './AvatarGardenPage.css';
import 'semantic-ui-css/semantic.min.css';
import React from 'react';
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

    const [visible, setVisible] = React.useState(false);
    const [avatarList, setAvatarList] = React.useState([]);

    var avatars = [ //This is a list that will hold the still image and name of avatar the user has created, needs to come from backend (Wahib)
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "Jane Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        { still: sampleVideo, name: "John Doe" },
        ];

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
                        {avatars.map(renderCard)}
                    </div>
                    <input className="garden-search" type="text" placeholder="&#xF002;" /*onKeyUp={}*//>
                    <div onClick={() => setVisible(true)}><img className="garden-menu_icon" src={menuButton} /></div>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
            </>
        </div>
    );
}

export default AvatarGardenPage;