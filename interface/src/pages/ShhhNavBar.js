import React from "react";
import "./ShhhNavBar.css";

function ShhhNavBar() {
  return (
    <div className="navigation">
      <h1 className="title worksans-extra-bold-geyser-27px">TOIA</h1>
      <div className="nav-logo">
        <div className="logo"></div>
      </div>
      <div className="nav-nav-menu">
        <div className="nav-nav-menu-item">
          <div className="button worksans-semi-bold-white-16px">Shhh</div>
        </div>
        <div className="nav-nav-menu-item">
          <div className="button worksans-semi-bold-white-16px">Talk To TOIA</div>
        </div>
        <a href="javascript:history.back()">
          <div className="nav-nav-menu-item">
            <div className="button worksans-semi-bold-white-16px">My TOIA</div>
          </div>
        </a>
        <div className="sign-up">
          <img
            className="icon-search"
            src="https://anima-uploads.s3.amazonaws.com/projects/63da6ff16523ff446abbd2f1/releases/63dac19b8eb88487d2d8c744/img/user-1@2x.png"
            alt="icon-search"
          />
          <div className="button worksans-semi-bold-white-16px">Log in</div>
        </div>
      </div>
    </div>
  );
}

export default ShhhNavBar;
