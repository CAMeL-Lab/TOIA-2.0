import * as React from "react";
import { Button, Card } from "semantic-ui-react";
import '../pages/Player.css';

  
export default function SuggestionCards(props) {

    // const suggestion1 = React.useRef(0)
    const suggestion2 = React.useRef(0)

    // keeping track of position of each of the five cards
    const firstFifth = React.useRef(0);
    const secondFifth = React.useRef(1);
    const thirdFifth = React.useRef(2);
    const fourthFifth = React.useRef(3);
    const lastFifth = React.useRef(4);

    if (props.questions.length > 2){
      suggestion2.current = Math.floor(props.questions.length/5);
    }

      // Function to increment count by 1
  const incrementCount1 = () => {
    // Update state with incremented value
    firstFifth.current = Math.max(firstFifth.current, secondFifth.current, thirdFifth.current, fourthFifth.current, lastFifth.current) +1;
  };
    // Function to increment count by 1
    const incrementCount2 = () => {
      // Update state with incremented value
      secondFifth.current = Math.max(firstFifth.current, secondFifth.current, thirdFifth.current, fourthFifth.current, lastFifth.current) +1;
    };
    // Function to increment count by 1
  const incrementCount3 = () => {
    // Update state with incremented value
    thirdFifth.current = Math.max(firstFifth.current, secondFifth.current, thirdFifth.current, fourthFifth.current, lastFifth.current) +1;
  };

  const incrementCount4 = () => {
    // Update state with incremented value
    fourthFifth.current = Math.max(firstFifth.current, secondFifth.current, thirdFifth.current, fourthFifth.current, lastFifth.current) +1;
  };

  const incrementCount5 = () => {
    // Update state with incremented value
    lastFifth.current = Math.max(firstFifth.current, secondFifth.current, thirdFifth.current, fourthFifth.current, lastFifth.current) +1;
  };

return props.questions ? (
  <Card.Group>
    <div className="card-1">
    <Card>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {props.questions[firstFifth.current%props.questions.length].question || "Loading ..." }

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = props.questions[firstFifth.current%props.questions.length].question;
        
              props.askQuestion(suggestion2, 1);
              incrementCount1();
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount1();
          props.suggestedQuestion2(firstFifth.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-2">
    <Card>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {props.questions[secondFifth.current%props.questions.length].question || "Loading ..." }

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = props.questions[secondFifth.current%props.questions.length].question;
        
              props.askQuestion(suggestion2, 1);
              incrementCount2();
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount2();
          props.suggestedQuestion2(secondFifth.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-3">
    <Card>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {props.questions[thirdFifth.current%props.questions.length].question || "Loading ..." }

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = props.questions[thirdFifth.current%props.questions.length].question;
        
              props.askQuestion(suggestion2, 1);
              incrementCount3();
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount3();
          props.suggestedQuestion2(thirdFifth.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-4">
    <Card>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {props.questions[fourthFifth.current%props.questions.length].question || "Loading ..." }

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = props.questions[fourthFifth.current%props.questions.length].question;
        
              props.askQuestion(suggestion2, 1);
              incrementCount4();
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount4();
          props.suggestedQuestion2(fourthFifth.current);
        }}/>
        </div>
      </Card.Content>
    </Card>
    </div>

    <div className="card-5">
    <Card>
      <Card.Content>
        <Card.Description size="mini" className="player-font-class-2">

         {props.questions[lastFifth.current%props.questions.length].question || "Loading ..." }

        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
        <Button content='ASK' color="linkedin" icon='send' labelPosition='left' onClick={()=>{
              

              suggestion2.current = props.questions[lastFifth.current%props.questions.length].question;
        
              props.askQuestion(suggestion2, 1);
              incrementCount5();
        }}/>
        <Button content='NEW' color="green" icon='undo alternate' labelPosition='right' onClick={()=>{
          
          incrementCount5();
          props.suggestedQuestion2(lastFifth.current);
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