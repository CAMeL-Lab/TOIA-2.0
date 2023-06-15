const saveToken = token => {
    console.log("saveToken", token);
	window.localStorage.setItem("token", token);
};

const getToken = () => {
	return window.localStorage.getItem("token") ?? "";
};

const saveUser = user => {
	window.localStorage.setItem("user", JSON.stringify(user));
};

const getUser = () => {
	return JSON.parse(window.localStorage.getItem("user")) ?? {};
};

const removeUser = () => {
	window.localStorage.removeItem("user");
};

const removeToken = () => {
	window.localStorage.removeItem("token");
};

const logout = () => {
	removeUser();
	removeToken();
};

export {
	saveToken,
	getToken,
	saveUser,
	getUser,
	removeUser,
	removeToken,
	logout,
};
