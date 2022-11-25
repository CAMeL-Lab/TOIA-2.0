import React, { useState, useEffect } from "react";
import alberto from "../images/alberto.jpeg";
import wahib from "../images/wahib.jpg";
import kertu from "../images/kertu.jpg";
import erin from "../images/erin.jpeg";
import nizar from "../images/nizar.jpg";
import goffredo from "../images/goffredo.jpeg";
import tyeece from "../images/Tyeece.jpg";
import armaan from "../images/armaan.jpg";
import nyuad from "../images/nyuad-rb.png";
import camel from "../images/camel.png";
import history from '../services/history';
import { Modal } from 'semantic-ui-react';
import sigDail from '../pdf/SIGDIAL_2021_TOIA_camera_ready_.pdf'
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import toia_logo from "../images/TOIA_Logo.png";
import Tracker from "../utils/tracker";

import NavBar from './NavBar.js';

import { Trans, useTranslation } from "react-i18next";

function AvatarViewPage() {
	/*functions in charge of opening and closing the various pop up menus*/

	const { t } = useTranslation();
	const [toiaName, setName] = useState(null);
	const [toiaLanguage, setLanguage] = useState(null);
	const [toiaID, setTOIAid] = useState(null);
	const [isLoggedIn, setLoginState] = useState(false);

	var input1, input2; //holds email and pass from popup

	useEffect(() => {
		if (history.location.state != undefined) {
			setLoginState(true);
			setName(history.location.state.toiaName);
			setLanguage(history.location.state.toiaLanguage);
			setTOIAid(history.location.state.toiaID);
		}

		// Tracker
		new Tracker().startTracking(history.location.state);
	}, []);

	var team = [// This is a list of all members names and their accompanying pictures

		{ still: alberto, member: "Alberto Chierici" },
		{ still: tyeece, member: "Tyeece Hensley" },
		{ still: wahib, member: "Wahib Kamran" },
		{ still: kertu, member: "Kertu Koss" },
		{ still: armaan, member: "Armaan Agrawal" },
		{ still: erin, member: "Erin Collins" },
		{ still: goffredo, member: "Goffredo Puccetti" },
		{ still: nizar, member: "Nizar Habash" },
	];

	const renderTeam = (card, index) => {
		//cards for members
		return (
			<div className="about-box border-0">
				<img
					src={card.still}
					className="image-sizing" //person thumbnail
				/>
				<div>
					<h1
						className="about-name" //name of person
					>
						{card.member}
					</h1>
				</div>
			</div>
		);
	};

	return (
		<div className="about-page">
			<NavBar
				toiaName={toiaName}
				toiaID={toiaID}
				isLoggedIn={isLoggedIn}
				toiaLanguage={toiaLanguage}
				history={history}
				showLoginModal={true}
			/>

			<div className="about-team">
				<h1 className={`about-heading ${t("alignment")}`}>{t("meet_the_team")}</h1>
				<h1 className={`about-heading ${t("alignment")}`}>{t("product_tagline")}</h1>
				<p className={`about-text ${t("alignment")}`}>{t("product_hook1")}<br />
					{t("product_hook2")}
					<br />
					<br />
					{t("product_description")}
					<br />
					{t("product_purpose")}
					<br />
					<br />
					<Trans i18nKey="product_summary" components={[<a href="https://nyuad.nyu.edu/en/" />, <a href="https://nyuad.nyu.edu/en/research/faculty-labs-and-projects/computational-approaches-to-modeling-language-lab.html" />]} />
				</p>
				<img src={toia_logo} className="toiaImage" />
				<div className="reference-links">
					<a href="#grid" className="reference-item">{t("meet_the_team")}</a>
					<a href="#scholarly" className="reference-item">{t("publications")}</a>
					<a href="https://github.com/wahibkamran/TOIA-2.0" className="reference-item">{t("github_repo")}</a>
				</div>
			</div>

			<div id="grid">
				<h1 className={`grid-heading ${t("alignment")}`}>{t("toia_team")}</h1>
				<div className="about-grid" //videos
				>
					{team.map(renderTeam)}
				</div>
			</div>

			<div id="scholarly">
				<p className={`publication-links ${t("alignment")}`}>{t("publication_links")}</p>
				<ul className="publications">
					<li>
						Alberto Chierici, Tyeece Hensley, Wahib Kamran, Kertu Koss, Armaan Agrawal, Erin Collins, Goffredo Puccetti and Nizar Habash, A Cloud-based User-Centered Time-Offset Interaction Application,
						SIGdial, April 2021 <a href={sigDail}>[PDF]</a>

					</li>
					<li>
						Nizar Habash and Alberto Chierchi, A View From the Crowd: Evaluation Challenges for Time-Offset Interaction Applications,
						Association for Computational Linguistics, April 2021, <a href="https://www.aclweb.org/anthology/2021.humeval-1.9.pdf">[PDF]</a>
						<a href="https://www.aclweb.org/anthology/2021.humeval-1.9.bib">[BIB]</a>
					</li>
					<li>
						Alberto Chierici, Nizar Habash, Margarita Bicec, The Margarita Dialogue Corpus: A Data Set for Time-Offset Interactions and Unstructured Dialogue Systems,
						Proceedings of the 12th Language Resources and Evaluation Conference, May 2020, <a href="https://www.aclweb.org/anthology/2020.lrec-1.60.pdf">[PDF]</a>
						<a href="https://www.aclweb.org/anthology/2020.lrec-1.60.bib">[BIB]</a>
					</li>
					<li>
						Dana Abu Ali, Muaz Ahmad, Hayat Al Hassan, Paula Dozsa, Ming Hu, Jose Varias, Nizar Habash, A Bilingual Interactive Human Avatar Dialogue System,
						Proceedings of the 19th Annual SIGdial Meeting on Discourse and Dialogue, July 2018, <a href="https://www.aclweb.org/anthology/W18-5027.pdf">[PDF]</a>
						<a href="https://www.aclweb.org/anthology/W18-5027.bib">[BIB]</a>
					</li>
				</ul>

			</div>
	



			<div className="logos">
				<a href="https://nyuad.nyu.edu/en/"><img src={nyuad} className="nyuadImage" /></a>

				<a href="https://nyuad.nyu.edu/en/research/faculty-labs-and-projects/computational-approaches-to-modeling-language-lab.html"><img src={camel} className="camelImage" /></a>
			</div>



			<NotificationContainer />
		</div >


	);
}

export default AvatarViewPage;
