import React from "react";
import ReactDOM from "react-dom";
// import './App.css'
// import './index.css';
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// import 'semantic-ui-css/semantic.min.css';
// import 'react-notifications/lib/notifications.css';
import "./main.scss";

{
	/* <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
  integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x"
  crossorigin="anonymous"
/> */
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
