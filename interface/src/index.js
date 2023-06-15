import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./main.scss";
import axios from "axios";
import { Service } from "axios-middleware";
import { getToken, saveToken, saveUser } from "./auth/auth";
import API_URLS from "./configs/api";

const service = new Service(axios);

service.register({
	onRequest(config) {
		// Attach token to the header
		const token = getToken();
		token &&
			token !== "" &&
			(config.headers.Authorization = `Bearer ${token}`);
		return config;
	},
	onResponse(response) {
		const url = response.config.url;
		if (url === API_URLS.SIGN_UP || url === API_URLS.LOGIN) {
			const responseData = JSON.parse(response.data);
			const token = responseData.token;
			const user = responseData.data;
			saveToken(token);
			saveUser(user);
		}
		return response;
	},
});

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
