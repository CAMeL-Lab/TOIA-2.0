import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "../pages/HomePage";
import SignUp from "../pages/SignUpPage";
import AvatarGarden from "../pages/AvatarGardenPage";
import AvatarLibrary from "../pages/AvatarLibraryPage";
import Settings from "../pages/AvatarSettings";
import AvatarView from "../pages/AvatarViewPage";
import Recorder from "../pages/Recorder";
import Player from "../pages/Player";
import EditRecorder from "../pages/EditRecorderPage";

export default function Routes() {
  return (
    <Switch>
		<Route path="/" exact component={Home} />
        <Route path="/signup" component={SignUp} />
		<Route path="/garden" component={AvatarGarden} />
		<Route path="/library" component={AvatarLibrary} />
		<Route path="/settings" component={Settings} />
		<Route path="/view" component={AvatarView} />
		<Route path="/recorder" component={Recorder} />
		<Route path="/editrecorder" component={EditRecorder} />
		<Route path="/player" component={Player} />
		
		{/* redirect user to SignIn page if route does not exist and user is not authenticated */}
		<Route component={Home} />

    </Switch>
  );
}