import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "../pages/HomePage";
import SignUp from "../pages/SignUpPage";
import AvatarGarden from "../pages/AvatarGardenPage";
import Shhh from "../pages/ShhhPage";
import AvatarLibrary from "../pages/AvatarLibraryPage";
import Settings from "../pages/AvatarStream";
import AboutUs from "../pages/AboutUsPage";
import Recorder from "../pages/Recorder";
import Player from "../pages/Player";
import shhhPlayer from "../pages/ShhhPlayer";
import EditRecorder from "../pages/EditRecorderPage";

export default function Routes() {
	return (
		<Switch>
			<Route path="/" exact component={Home} />
			<Route path="/shhh" exact component={Shhh} />
			<Route path="/signup" component={SignUp} />
			<Route path="/mytoia" component={AvatarGarden} />
			<Route path="/library" component={AvatarLibrary} />
			<Route path="/stream" component={Settings} />
			<Route path="/about" component={AboutUs} />
			<Route path="/recorder" component={Recorder} />
			<Route path="/editrecorder" component={EditRecorder} />
			<Route path="/player" component={Player} />
			<Route path="/shhhplayer" component={shhhPlayer} />

			{/* redirect user to SignIn page if route does not exist and user is not authenticated */}
			<Route component={Home} />
		</Switch>
	);
}
