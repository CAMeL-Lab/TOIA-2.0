// import * as React from "react";
import React, { useEffect, useState } from "react";
import { Button, Card } from "semantic-ui-react";
import '../pages/ShhhPage.css';

export default function ShhhSuggestionCards(props) {
    // keeping track of position of each of the five cards
    // const firstQuestion = React.useRef(0);
    const [firstQuestion, setFirstQuestion] = useState({
        questionData: null,
        waiting: true,
        highlighBackground: false,
    });

    const [secondQuestion, setSecondQuestion] = useState({
        questionData: null,
        waiting: true,
        highlighBackground: false,
    });

    const [thirdQuestion, setThirdQuestion] = useState({
        questionData: null,
        waiting: true,
        highlighBackground: false,
    });

    const [fourthQuestion, setFourthQuestion] = useState({
        questionData: null,
        waiting: true,
        highlighBackground: false,
    });

    const [fifthQuestion, setFifthQuestion] = useState({
        questionData: null,
        waiting: true,
        highlighBackground: false,
    });

    const cardQuestions = [
        firstQuestion,
        secondQuestion,
        thirdQuestion,
        fourthQuestion,
        fifthQuestion,
    ];
    // const setQuestion = [setFirstQuestion,setSecondQuestion,setThirdQuestion,setFourthQuestion,setFifthQuestion];

    const getSuggestion = questionCard => {
        // console.log("getSuggestion:");
        // console.log(questionCard.questionData && questionCard.questionData.question ? questionCard.questionData.question : "No question loaded!");
        return questionCard.questionData && questionCard.questionData.question
            ? questionCard.questionData.question
            : "Loading ...";
    };

    const delayedQuestionCardChange = (questionCard, setQuestionCard) => {
        return () => {
            questionCard.highlighBackground = false;
            if (questionCard.waiting) {
                questionCard.questionData = null;
                setQuestionCard({ ...questionCard });
            }
        };
    };

    const askQuestion = (questionCard, setQuestionCard) => {
        // console.log("askQuestion:");
        props.askQuestion(questionCard.questionData);
        questionCard.waiting = true;
        questionCard.highlighBackground = true;
        setTimeout(
            delayedQuestionCardChange(questionCard, setQuestionCard),
            3000,
        );
        setQuestionCard({ ...questionCard });
    };

    const getNextQuestion = (questionCard, setQuestionCard) => {
        // console.log("getNextQuestion:");
        if (props.questions.length > 0) {
            // console.log("getNextQuestion: got question");
            questionCard.questionData = props.questions.pop();
            setQuestionCard({ ...questionCard });
        }
    };

    const refreshQuestion = (questionCard, setQuestionCard) => {
        // console.log("refreshQuestion: refreshing question...");
        if (
            props.questions.length > 0 &&
            questionCard.waiting &&
            props.shouldRefreshQuestions?.current
        ) {
            // console.log("refreshQuestion: refreshed question...");
            questionCard.waiting = false;
            questionCard.highlighBackground = false;
            questionCard.questionData = props.questions.pop();
            // console.log("refreshQuestion: new question: ", questionCard.questionData.question);
            setQuestionCard({ ...questionCard });
        }
    };

    const shouldStopRefreshing = () => {
        for (let questionCard in cardQuestions) {
            // If any card question is still waiting, even after updating the questions
            // Then we still want to refresh questions where possible
            if (questionCard.waiting && props.shouldRefreshQuestions?.current) {
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        getNextQuestion(firstQuestion, setFirstQuestion);
        getNextQuestion(secondQuestion, setSecondQuestion);
    }, []);

    return props.questions ? (
        <Card.Group className="shhh-player-cards-wrapper">
            <div className="card-4">
                <Card
                    className={`card-overview card-waiting-${fourthQuestion.highlighBackground}`}
                    style={{ background: "#555555" }}
                >
                    <Card.Content>
                        <Card.Description
                            size="mini"
                            className="player-font-class-2"
                        >
                            {refreshQuestion(fourthQuestion, setFourthQuestion)}
                            {getSuggestion(fourthQuestion)}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <div className="ui two buttons">
                            <Button
                                style={{ background: "#614CB8" }}
                                icon="send"
                                onClick={() => {
                                    askQuestion(
                                        fourthQuestion,
                                        setFourthQuestion,
                                    );
                                }}
                            />
                            <Button
                                style={{ background: "#8F78CE" }}
                                icon="undo alternate"
                                onClick={() => {
                                    getNextQuestion(
                                        fourthQuestion,
                                        setFourthQuestion,
                                    );
                                }}
                            />
                        </div>
                    </Card.Content>
                </Card>
            </div>

            <div className="card-3">
                <Card
                    className={`card-overview shhhcard-waiting-${thirdQuestion.highlighBackground}`}
                    style={{ background: "#555555" }}
                >
                    <Card.Content>
                        <Card.Description
                            size="mini"
                            className="player-font-class-2"
                        >
                            {refreshQuestion(thirdQuestion, setThirdQuestion)}
                            {getSuggestion(thirdQuestion)}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <div className="ui two buttons">
                            <Button
                                style={{ background: "#614CB8" }}
                                icon="send"
                                onClick={() => {
                                    askQuestion(
                                        thirdQuestion,
                                        setThirdQuestion,
                                    );
                                }}
                            />
                            <Button
                                style={{ background: "#8F78CE" }}
                                icon="undo alternate"
                                onClick={() => {
                                    getNextQuestion(
                                        thirdQuestion,
                                        setThirdQuestion,
                                    );
                                }}
                            />
                        </div>
                    </Card.Content>
                </Card>
            </div>

            <div className="card-2">
                <Card
                    className={`card-overview card-waiting-${secondQuestion.highlighBackground}`}
                    style={{ background: "#555555" }}
                >
                    <Card.Content>
                        <Card.Description
                            size="mini"
                            className="player-font-class-2"
                        >
                            {refreshQuestion(secondQuestion, setSecondQuestion)}
                            {getSuggestion(secondQuestion)}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <div className="ui two buttons">
                            <Button
                                style={{ background: "#614CB8" }}
                                icon="send"
                                onClick={() => {
                                    askQuestion(
                                        secondQuestion,
                                        setSecondQuestion,
                                    );
                                }}
                            />
                            <Button
                                style={{ background: "#8F78CE" }}
                                icon="undo alternate"
                                onClick={() => {
                                    getNextQuestion(
                                        secondQuestion,
                                        setSecondQuestion,
                                    );
                                }}
                            />
                        </div>
                    </Card.Content>
                </Card>
            </div>

            <div className="card-1">
                <Card
                    className={`card-overview card-waiting-${firstQuestion.highlighBackground}`}
                    style={{ background: "#555555" }}
                >
                    <Card.Content>
                        <Card.Description
                            size="mini"
                            className="player-font-class-2"
                        >
                            {refreshQuestion(firstQuestion, setFirstQuestion)}
                            {getSuggestion(firstQuestion)}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <div className="ui two buttons">
                            <Button
                                style={{ background: "#614CB8" }}
                                icon="send"
                                onClick={() => {
                                    askQuestion(
                                        firstQuestion,
                                        setFirstQuestion,
                                    );
                                }}
                            />
                            <Button
                                style={{ background: "#8F78CE" }}
                                icon="undo alternate"
                                onClick={() => {
                                    getNextQuestion(
                                        firstQuestion,
                                        setFirstQuestion,
                                    );
                                }}
                            />
                        </div>
                    </Card.Content>
                </Card>
            </div>

            {shouldStopRefreshing() ? props.setRefreshQuestionsFalse() : ""}
        </Card.Group>
    ) : null;
}

