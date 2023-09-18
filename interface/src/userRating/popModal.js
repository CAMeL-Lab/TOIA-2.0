import React from "react";
import "./popModal.css";
import RatingWords from "./ratingWords";

function PopModal({ ratingNodes, setRatingNodes, hasRated, setHasRated, ratingParams, interactionLanguage }) {
	
	function skipRatings() {
		setHasRated(true);
	}

	function submitRatings() {
		// submit all ratings one by one
		ratingNodes.forEach((node, index) => {
			node.onSubmitRating(ratingNodes[index].rating, ratingParams, interactionLanguage);
		});
		setHasRated(true);
	}

	// Returns a function that sets the appropriate rating node's rating
	function changeRatingFunction(nodeIndex){
		return function(ratingValue) {
			ratingNodes[nodeIndex].rating = ratingValue
			setRatingNodes(ratingNodes);
		}
	}

	function getRatingForm(){
		let ratingFormNodes = [];
		ratingNodes.forEach((node, index) => {
			ratingFormNodes.push(
					<>
						<div className="popup-title">
							<h2>
							{node.text}
							</h2>
						</div>
						<div className="popup-body">
							<h3>
								<RatingWords recUserRating={changeRatingFunction(index)} />
							</h3>
						</div>
						<hr/>
					</>
				);
			}
		);
		return ratingFormNodes;
	}

	return (<>
		{!hasRated && (<div className="modalBackground">
			<div className="modalContainer">

				{ getRatingForm() }
				

				<div onClick={skipRatings} className="pop-modal-skiptext">
					Skip
				</div>
				<div onClick={submitRatings} className="pop-modal-submittext">
					Submit
				</div>
			</div>
		</div>)
		}
		</>
	);
}

export default PopModal;
