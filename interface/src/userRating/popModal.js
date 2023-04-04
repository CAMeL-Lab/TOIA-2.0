import React from "react";
import "./popModal.css";
import RatingWords from "./ratingWords";

function PopModal({ userRating, skip }) {
	return (
		<div className="modalBackground">
			<div className="modalContainer">
				<div className="title">
					<h2>
						How well does this answer fit with your question or the
						conversation you're having with the avatar?
					</h2>
				</div>

				<div className="body">
					<h3>
						<RatingWords recUserRating={userRating} />
					</h3>
				</div>
				<div onClick={skip} className="skipText">
						Skip
					</div>
			</div>
		</div>
	);
}

export default PopModal;
