import jwtDecode from "jwt-decode";

const saveToken = token => {
	console.log("saveToken", token);
	window.localStorage.setItem("auth_token", token);
};

const getToken = () => {
	return window.localStorage.getItem("auth_token");
};

const getUser = () => {
	try {
		let user = jwtDecode(getToken());
		return user;
	} catch (error) {
		logout();
		console.error(error);
		return null;
	}
};

const removeToken = () => {
	window.localStorage.removeItem("auth_token");
};

const logout = () => {
	removeToken();
};

const attachToken = config => {
	const token = getToken();
	token && (config.headers.Authorization = `Bearer ${token}`);
	return config;
};

const isLoggedIn = () => {
	const token = getToken();
	return !!token;
};

export {
	saveToken,
	getToken,
	getUser,
	removeToken,
	logout,
	attachToken,
	isLoggedIn,
};
