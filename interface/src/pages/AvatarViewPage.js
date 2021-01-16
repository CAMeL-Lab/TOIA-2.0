import './App.css';
import './AvatarViewPage.css';
import React from "react";
import submitButton from "../icons/submit-button.svg";
import backButton from "../icons/back-button.svg";
import video from "../icons/sample-video.svg"
import history from '../services/history';


function AvatarViewPage() {
    
    var input1, input2, input3, input4, input5; //will hold the settings data of avatars  and become default value
    //will need a backend function to get data from database, input5 holds the language the user will be speaking in 
    //to the dialogue manager (Wahib)
    
    var inputName= "language";

    input1 = "Jane Doe";
    input2 = "John Smith"
    input3 = "English"
    input4 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tellus felis, viverra in leo id, suscipit egestas lorem. Integer posuere pretium aliquam. Vestibulum tincidunt viverra augue, quis iaculis risus cursus ac."
    
    function goBack(){
        history.goBack();
    }
    
    function myChangeHandler(event){
        event.preventDefault();
        var name = event.target.name;
    
        switch(name) {
          case inputName:
            input5 = event.target.value;
            break;
        }
    }
     
    //a function will be needed to send input5 to database (wahib)
    
    return (
        <div className="view-page">
            <img className="view-still" src={video}/>
            <input  /*onClick={}*/ className="view-submit-button smart-layers-pointers " type="image" src={submitButton} alt="Submit"/>
            <div className="view-group">
                <div className="view-name view-font-class-1 ">Name: </div>
                <input
                    className="view-name_box view-font-class-1"
                    defaultValue = {input1}
                    type={"text"}
                />
                <div className="view-creator view-font-class-1 ">Creator: </div>
                <input
                    className="view-creator_box view-font-class-1"
                    defaultValue = {input2}
                    type={"text"}
                />
                <div className="view-lang view-font-class-1 ">Language: </div>
                <input
                    className="view-lang_box view-font-class-1"
                    defaultValue = {input3}
                    type={"text"}
                />
                <div className="view-bio view-font-class-1 ">Bio: </div>
                <textarea
                    className="view-bio_box view-font-class-1"
                    defaultValue = {input4}
                    type={"text"}
                />
                <select className="view-lang2_box view-font-class-1" name={inputName} onChange={myChangeHandler}>
                    <option value="" disabled selected hidden>What language would you like to speak in..</option>
                    <option value="AF">Afrikaans</option>
                    <option value="SQ">Albanian</option>
                    <option value="AR">Arabic</option>
                    <option value="HY">Armenian</option>
                    <option value="EU">Basque</option>
                    <option value="BN">Bengali</option>
                    <option value="BG">Bulgarian</option>
                    <option value="CA">Catalan</option>
                    <option value="KM">Cambodian</option>
                    <option value="ZH">Chinese (Mandarin)</option>
                    <option value="HR">Croatian</option>
                    <option value="CS">Czech</option>
                    <option value="DA">Danish</option>
                    <option value="NL">Dutch</option>
                    <option value="EN">English</option>
                    <option value="ET">Estonian</option>
                    <option value="FJ">Fiji</option>
                    <option value="FI">Finnish</option>
                    <option value="FR">French</option>
                    <option value="KA">Georgian</option>
                    <option value="DE">German</option>
                    <option value="EL">Greek</option>
                    <option value="GU">Gujarati</option>
                    <option value="HE">Hebrew</option>
                    <option value="HI">Hindi</option>
                    <option value="HU">Hungarian</option>
                    <option value="IS">Icelandic</option>
                    <option value="ID">Indonesian</option>
                    <option value="GA">Irish</option>
                    <option value="IT">Italian</option>
                    <option value="JA">Japanese</option>
                    <option value="JW">Javanese</option>
                    <option value="KO">Korean</option>
                    <option value="LA">Latin</option>
                    <option value="LV">Latvian</option>
                    <option value="LT">Lithuanian</option>
                    <option value="MK">Macedonian</option>
                    <option value="MS">Malay</option>
                    <option value="ML">Malayalam</option>
                    <option value="MT">Maltese</option>
                    <option value="MI">Maori</option>
                    <option value="MR">Marathi</option>
                    <option value="MN">Mongolian</option>
                    <option value="NE">Nepali</option>
                    <option value="NO">Norwegian</option>
                    <option value="FA">Persian</option>
                    <option value="PL">Polish</option>
                    <option value="PT">Portuguese</option>
                    <option value="PA">Punjabi</option>
                    <option value="QU">Quechua</option>
                    <option value="RO">Romanian</option>
                    <option value="RU">Russian</option>
                    <option value="SM">Samoan</option>
                    <option value="SR">Serbian</option>
                    <option value="SK">Slovak</option>
                    <option value="SL">Slovenian</option>
                    <option value="ES">Spanish</option>
                    <option value="SW">Swahili</option>
                    <option value="SV">Swedish </option>
                    <option value="TA">Tamil</option>
                    <option value="TT">Tatar</option>
                    <option value="TE">Telugu</option>
                    <option value="TH">Thai</option>
                    <option value="BO">Tibetan</option>
                    <option value="TO">Tonga</option>
                    <option value="TR">Turkish</option>
                    <option value="UK">Ukrainian</option>
                    <option value="UR">Urdu</option>
                    <option value="UZ">Uzbek</option>
                    <option value="VI">Vietnamese</option>
                    <option value="CY">Welsh</option>
                    <option value="XH">Xhosa</option>
                </select>
            </div>
            <div onClick={goBack}><img className="view-back_icon" src={backButton} /></div>
        </div>
    );
}

export default AvatarViewPage;