// import * as React from "react";
import React, { useState } from "react";
import { Button, Card } from "semantic-ui-react";
import '../pages/Player.css';

  
export default function SuggestionCards(props) {

    // const suggestion1 = React.useRef(0)
    const suggestion2 = React.useRef(0);

    // keeping track of position of each of the five cards
    // const firstQuestion = React.useRef(0);
    const [firstQuestion, setFirstQuestion] = useState({question: "", waiting:false, prevValue:0});

    const [secondQuestion, setSecondQuestion] = useState({question: "", waiting:false, prevValue:0});

    const [thirdQuestion, setThirdQuestion] = useState({question: "", waiting:false, prevValue:0});

    const [fourthQuestion, setFourthQuestion] = useState({question: "", waiting:false, prevValue:0});

    const [fifthQuestion, setFifthQuestion] = useState({question: "", waiting:false, prevValue:0});

    // const cardQuestions = [firstQuestion, secondQuestion, thirdQuestion, fourthQuestion, fifthQuestion];
    const setQuestion = [setFirstQuestion,setSecondQuestion,setThirdQuestion,setFourthQuestion,setFifthQuestion];

    const waitingForNewQuestion = false; // variable to indicate whether we are waiting for a new question from express to come in

    if (props.questions.length > 2){
      suggestion2.current = Math.floor(props.questions.length/5);
    }

    // Function to increment count of question card
    // Increment count means to move to an index of a new question
    // const incrementCount = (questionCardIndex, cardNumber) => {
    //   // Do not move to next question if we are currently waiting for a new question
    //   if (questionCardIndex.current < props.questions.length && !waitingForNewQuestion) {
    //     // First get the max index of each card. Then we add 1 to it to get the new questionCardIndex
    //     const max_index = Math.max(firstQuestion.current, secondQuestion.current, thirdQuestion.current, fourthQuestion.current, fifthQuestion.current);

    //     // If we are waiting for a question already in the given card, we do not do anything
    //     if (!questionCardIndex.waiting){
    //       // If the new value of the card exceeds the length, we wait for a new question, but show the previous value of the card as a placeholder
    //       if (max_index + 1 >= props.questions.length){
    //         questionCardIndex.waiting = true;
    //         questionCardIndex.prevValue = questionCardIndex.current;
    //       }
    //       // The new value of the card is max_index+1
    //       questionCardIndex.current = max_index + 1;
    //       // We use setter function to update the values visually in the page
    //       setQuestion[cardNumber-1](questionCardIndex);
    //     }
        
    //   }
    // };

    const loadingSuggestion = {
      question: "Loading ...",
      url: '-1',
    }

    const getSuggestion = (questionCardIndex, cardNumber) => {
      const question = props.questions.pop();
      setFirstQuestion(question)
      return question;
    };

    // const getSuggestion = (questionCardIndex, cardNumber) => {
    //   // If the index of the questionCard is beyond the length of the array, return previous question
    //   // This shows we are waiting
    //   if (questionCardIndex.current >= props.questions.length){
    //     return props.questions[questionCardIndex.prevValue] || loadingSuggestion;
    //   }
    //   // If the length has now exceeded the new index of questionCardIndex AND we are waiting,
    //   // then we set waiting to false and update values
    //   else if (questionCardIndex.waiting){
    //     questionCardIndex.waiting = false;
    //     setQuestion[cardNumber-1](questionCardIndex);
    //   }
    //   // The following statement does one of two things:
    //   // 1. If the length is greater than the card number (so we are not waiting), return the question
    //   // 2. Otherwise, return "Loading ..." placeholder
    //   return props.questions.length >= cardNumber ? props.questions[questionCardIndex.current] : "Loading ...";
    // };

return props.questions ? (
  <Card.Group>
    <div className="card-1">
    <Card className={`card-overview card-waiting-${firstQuestion.waiting}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {getSuggestion(firstQuestion, 1).question}

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = getSuggestion(firstQuestion, 1);
              props.askQuestion(suggestion2, 1);
              incrementCount(firstQuestion, 1);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          incrementCount(firstQuestion, 1);
          props.suggestedQuestion2(firstQuestion.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-2">
    <Card className={`card-overview card-waiting-${secondQuestion.waiting}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

        {getSuggestion(secondQuestion, 2).question}

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = getSuggestion(secondQuestion, 2);
              props.askQuestion(suggestion2, 1);
              incrementCount(secondQuestion, 2);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          incrementCount(secondQuestion, 2);
          props.suggestedQuestion2(secondQuestion.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-3">
    <Card className={`card-overview card-waiting-${thirdQuestion.waiting}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

        {getSuggestion(thirdQuestion, 3).question}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = getSuggestion(thirdQuestion, 3);

              props.askQuestion(suggestion2, 1);
              incrementCount(thirdQuestion, 3);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount(thirdQuestion, 3);
          props.suggestedQuestion2(thirdQuestion.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-4">
    <Card className={`card-overview card-waiting-${fourthQuestion.waiting}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

        {getSuggestion(fourthQuestion, 4).question}

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = getSuggestion(fourthQuestion, 4);

              props.askQuestion(suggestion2, 1);
              incrementCount(fourthQuestion, 4);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount(fourthQuestion, 4);
          props.suggestedQuestion2(fourthQuestion.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-5">
    <Card className={`card-overview card-waiting-${fifthQuestion.waiting}`}>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

        {getSuggestion(fifthQuestion, 5).question}

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = getSuggestion(fifthQuestion, 5);

              props.askQuestion(suggestion2, 1);
              incrementCount(fifthQuestion, 5);
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount(fifthQuestion, 5);
          props.suggestedQuestion2(fifthQuestion.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

  </Card.Group>
  
): null
};


/**
 * 
 * 
 * 
 * 
 

*/