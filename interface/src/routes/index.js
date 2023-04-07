import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "../pages/HomePage";
import SignUp from "../pages/SignUpPage";
import AvatarGarden from "../pages/AvatarGardenPage";
import AvatarLibrary from "../pages/AvatarLibraryPage";
import Settings from "../pages/AvatarStream";
import AboutUs from "../pages/AboutUsPage";
import Recorder from "../pages/Recorder";
import Player from "../pages/Player";
import EditRecorder from "../pages/EditRecorderPage";

import i18n from "i18next";
import { useTranslation, initReactI18next, Trans } from "react-i18next";

// Translation files
import translationsEn from "../locales/en/translations";
import translationsEs from "../locales/es/translations";
import translationsAr from "../locales/ar/translations";
import translationsFr from "../locales/fr/translations";


// TODO: Implement cookies to store information on reactjs, rather than using the `history` object
// TODO: Remove interpolation from i18next for security (so we can set escape value: true)
// Do this by converting {value} to {{value}} in the string, then pass `value` as a parameter into the `t` function
// Example `hello`: `Hello {{user}}!`
// In other pages:   t("hello", {user: "Jack"})

i18n
.use(initReactI18next) // passes i18n down to react-i18next
.init({
  resources: {
    en: { translation: translationsEn },
    fr: { translation: translationsFr },
    ar: { translation: translationsAr },
    es: { translation: translationsEs },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  // debug: true,
});


export default function Routes() {
	return (
		<Switch>
			<Route path="/" exact component={Home} />
			<Route path="/signup" component={SignUp} />
			<Route path="/mytoia" component={AvatarGarden} />
			<Route path="/library" component={AvatarLibrary} />
			<Route path="/stream" component={Settings} />
			<Route path="/about" component={AboutUs} />
			<Route path="/recorder" component={Recorder} />
			<Route path="/editrecorder" component={EditRecorder} />
			<Route path="/player" component={Player} />

			{/* redirect user to SignIn page if route does not exist and user is not authenticated */}
			<Route component={Home} />
		</Switch>
	);
}
