// import * as React from "react";
import React, { useEffect, useState } from "react";
import { Button, Card } from "semantic-ui-react";
import "../pages/Player.css";

export default function SuggestionCards(props) {
	const QuestionsToDisplay = 5;
	const [displayedQuestions, setDisplayedQuestions] = useState([]);
	const [nextAt, setNextAt] = useState(0);
	// const [askedQuestions, setAskedQuestions] = useState([]);
	// const [unAskedunDisplayedQuestions, setUnAskedUnDisplayedQuestions] = useState([]);

	useEffect(() => {
		if (props.questions) {
			// Set first QuestionsToDisplay from props.questions
			if ((props.questions).length <= QuestionsToDisplay) {
				setDisplayedQuestions(props.questions);
			} else {
				setDisplayedQuestions(props.questions.slice(0, QuestionsToDisplay));
			}
			setNextAt(Math.min(QuestionsToDisplay, (props.questions).length));
		}
	}, [props.questions])

	const askQuestion = (item) => {
		const question = item.question;
		const displayeDList = displayedQuestions.map(item => item.question);
		const index = displayeDList.indexOf(question);
		const maxLength = (props.questions).length;
		let currentNextAt = nextAt % maxLength;
		let nextQuestion = null;
		do {
			nextQuestion = props.questions[currentNextAt]
			currentNextAt = (currentNextAt + 1) % maxLength;
		} while (currentNextAt != nextAt % maxLength && displayeDList.includes(nextQuestion.question))
		setNextAt(currentNextAt);

		// set new displayed
		setTimeout(() => {
			let newDisplayedQuestions = [...displayedQuestions];
			newDisplayedQuestions[index] = nextQuestion;
			setDisplayedQuestions(newDisplayedQuestions);
		}, 2000)
		
		props.askQuestion(item);
	};

	return props.questions ? (
			<div className="suggestions_card">
					{
						displayedQuestions.map((item) => {
							return (
								<Button
								 	className="othercard"
									content={item.question}
									onClick={(e) => askQuestion(item)}
									/>
							)
						})
					}
			</div>
	) : null;
}
