import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { getToken, saveToken } from "./auth/auth";
import API_URLS from "./configs/backend-urls";
import "./main.scss";
import reportWebVitals from "./reportWebVitals";

axios.interceptors.request.use(
	request => {
		try {
			request.headers.Authorization = `Bearer ${getToken()}`;
		} catch (error) {
			console.error(error);
		}
		return request;
	},
	error => {
		return Promise.reject(error);
	},
);

axios.interceptors.response.use(
	response => {
		try {
			const url = response.config.url;
			if (url === API_URLS.SIGN_UP() || url === API_URLS.LOGIN()) {
				const responseData = response.data;
				if (responseData.hasOwnProperty("token")) {
					const token = responseData.token;
					if (token) {
						saveToken(token);
					}
				}
			}
		} catch (error) {
			console.error(error);
		}

		return response;
	},
	error => {
		return Promise.reject(error);
	},
);

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
);


reportWebVitals();
