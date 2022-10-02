// import * as React from "react";
import React, { useEffect, useState } from "react";
import { Button, Card } from "semantic-ui-react";
import '../pages/Player.css';

  
export default function SuggestionCards(props) {

    // keeping track of position of each of the five cards
    // const firstQuestion = React.useRef(0);
    const [firstQuestion, setFirstQuestion] = useState({questionData: null, waiting:true, highlighBackground:false});

    const [secondQuestion, setSecondQuestion] = useState({questionData: null, waiting:true, highlighBackground:false});

    const [thirdQuestion, setThirdQuestion] = useState({questionData: null, waiting:true, highlighBackground:false});

    const [fourthQuestion, setFourthQuestion] = useState({questionData: null, waiting:true, highlighBackground:false});

    const [fifthQuestion, setFifthQuestion] = useState({questionData: null, waiting:true, highlighBackground:false});

    const cardQuestions = [firstQuestion, secondQuestion, thirdQuestion, fourthQuestion, fifthQuestion];
    // const setQuestion = [setFirstQuestion,setSecondQuestion,setThirdQuestion,setFourthQuestion,setFifthQuestion];

    const getSuggestion = (questionCard) => {
      // console.log("getSuggestion:");
      // console.log(questionCard.questionData && questionCard.questionData.question ? questionCard.questionData.question : "No question loaded!");
      return questionCard.questionData && questionCard.questionData.question ? questionCard.questionData.question : "Loading ...";
    };

    const delayedQuestionCardChange = (questionCard, setQuestionCard) => {
      return () => {
        questionCard.highlighBackground = false;
        if(questionCard.waiting){
          questionCard.questionData = null;
          setQuestionCard({...questionCard});
        }
      }
    }

    const askQuestion = (questionCard, setQuestionCard) => {
      // console.log("askQuestion:");
      props.askQuestion(questionCard.questionData);
      questionCard.waiting = true;
      questionCard.highlighBackground = true;
      setTimeout(delayedQuestionCardChange(questionCard, setQuestionCard), 3000);
      setQuestionCard({...questionCard});
    }

    const getNextQuestion = (questionCard, setQuestionCard) => {
      // console.log("getNextQuestion:");
      if (props.questions.length > 0){
        // console.log("getNextQuestion: got question");
        questionCard.questionData = props.questions.pop();
        setQuestionCard({...questionCard});
      }
    };

    const refreshQuestion = (questionCard, setQuestionCard) => {
      // console.log("refreshQuestion: refreshing question...");
      if (props.questions.length > 0 && questionCard.waiting && props.shouldRefreshQuestions?.current){
        // console.log("refreshQuestion: refreshed question...");
        questionCard.waiting = false;
        questionCard.highlighBackground = false;
        questionCard.questionData = props.questions.pop();
        // console.log("refreshQuestion: new question: ", questionCard.questionData.question);
        setQuestionCard({...questionCard});
      }
    };

    const shouldStopRefreshing = ()=>{
      for (let questionCard in cardQuestions) {
        // If any card question is still waiting, even after updating the questions
        // Then we still want to refresh questions where possible
        if (questionCard.waiting && props.shouldRefreshQuestions?.current){
          return false;
        }
      }
      return true;
    }

    useEffect(()=>{
      getNextQuestion(firstQuestion, setFirstQuestion);
      getNextQuestion(secondQuestion, setSecondQuestion);
    }, []);



return props.questions ? (
  <Card.Group>

    <div className="card-5">
    <Card className={`card-overview card-waiting-${fifthQuestion.highlighBackground}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">
        {refreshQuestion(fifthQuestion, setFifthQuestion)}
        {getSuggestion(fifthQuestion)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              askQuestion(fifthQuestion, setFifthQuestion);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          getNextQuestion(fifthQuestion, setFifthQuestion);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-4">
    <Card className={`card-overview card-waiting-${fourthQuestion.highlighBackground}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">
        {refreshQuestion(fourthQuestion, setFourthQuestion)}
        {getSuggestion(fourthQuestion)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              askQuestion(fourthQuestion, setFourthQuestion);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          getNextQuestion(fourthQuestion, setFourthQuestion);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-3">
    <Card className={`card-overview card-waiting-${thirdQuestion.highlighBackground}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">
        {refreshQuestion(thirdQuestion, setThirdQuestion)}
        {getSuggestion(thirdQuestion)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              askQuestion(thirdQuestion, setThirdQuestion);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          getNextQuestion(thirdQuestion, setThirdQuestion);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-2">
    <Card className={`card-overview card-waiting-${secondQuestion.highlighBackground}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">
        {refreshQuestion(secondQuestion, setSecondQuestion)}
        {getSuggestion(secondQuestion)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              askQuestion(secondQuestion, setSecondQuestion);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          getNextQuestion(secondQuestion, setSecondQuestion);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-1">
    <Card className={`card-overview card-waiting-${firstQuestion.highlighBackground}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">
        {refreshQuestion(firstQuestion, setFirstQuestion)}
        {getSuggestion(firstQuestion)}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              askQuestion(firstQuestion, setFirstQuestion);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          getNextQuestion(firstQuestion, setFirstQuestion);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    {shouldStopRefreshing() ? props.setRefreshQuestionsFalse() : ''}

  </Card.Group>
  
): null
};


/**
 * 
 * 
 * 
 * 
 

*/