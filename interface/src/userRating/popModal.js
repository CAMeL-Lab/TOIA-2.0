import React from "react";
import {Button, Image, Modal, Popup, TextArea, Icon, Rating} from 'semantic-ui-react';
import "./popModal.css";
import RatingWords from './ratingWords';


function PopModal({setRating,  setRatingDone,  userRating, newRatingVal, skipFillerVid}) {
  return (
    <div className="modalBackground">
      <div className="modalContainer">
        {/* <div className="titleCloseBtn">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
          >
            &times;
          </button>
        </div> */}
        <div className="title">
          <h2>How well does this answer fit with your question or the conversation you're having with the avatar?</h2>
        </div>

        <div className="body">
          <h3><RatingWords setRatingValue={setRating} setRatingComplete={setRatingDone} recUserRating={ userRating} newUserRatingVal={newRatingVal} skipFillVideo={skipFillerVid}/></h3>
          
           {/* <h3><RatingSentiments/></h3> */}
        </div>
        {/* <div className="footer">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            id="cancelBtn"
          >
             Submit
          </button>
         
        </div> */}
      </div>
    </div>
  );
}



export default PopModal;
