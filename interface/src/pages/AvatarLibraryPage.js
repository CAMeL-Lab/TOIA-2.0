import './App.css';
import './AvatarLibraryPage.css';
import 'semantic-ui-css/semantic.min.css';
import React from 'react';
import { Card } from "react-bootstrap";
import menuButton from "../icons/menu-button.svg";
import sampleVideo from "../icons/sample-video.svg";
import history from '../services/history';
import {Menu, Sidebar, Segment } from 'semantic-ui-react';
import axios from 'axios';

function AvatarLibraryPage() {
    
    const [visible, setVisible] = React.useState(false)
    const [avatarList, setAvatarList] = React.useState([]);
    const [avatarCards, setAvatarCards] = React.useState(''); 

    React.useEffect(() => {
        axios.get('http://localhost:3000/getAllAvatars').then((res)=>{
            setAvatarList(res.data);
            setAvatarCards(avatarList.map(renderCard));
        });
    });

    const renderCard = (avatar, index) => {
        return(
            <Card onClick={view} key={index} className="library-box border-0">
                <Card.Img className="library-still"variant="top" src={sampleVideo}/>
                <Card.Body>
                    <Card.Title className="library-name">{avatar}</Card.Title>
                </Card.Body>
            </Card>
        )
    }
    //A delete function, that deletes the specific avatar in aws (Wahib)

    function view(){
        history.push({
          pathname: '/view',
        });
    }

    function mainmenu() {
        history.push({
           pathname: '/mainmenu',
         }); 
     }
 
     function logout(){
         //logout function needs to be implemented (wahib)
         history.push({
             pathname: '/',
           });
     } 

    return (
        <div className="library-page">
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
                        <div onClick={mainmenu} className="library-menu-item">Exit to Main Menu</div>
                    </Menu.Item>
                    <Menu.Item >
                    <div onClick={logout} className="library-menu-item red">Logout</div>
                    </Menu.Item>
                </Sidebar>

                <Sidebar.Pusher dimmed={visible}>
                    <div onClick={() => setVisible(true)}><img className="library-menu_icon" src={menuButton} /></div>
                    <input className="library-search" type="text" placeholder="&#xF002;" /*onKeyUp={}*//>
                    <div className ="library-grid">
                        {avatarCards}
                    </div>

                </Sidebar.Pusher>
            </Sidebar.Pushable>
            </>
        </div>
    );
}

export default AvatarLibraryPage;