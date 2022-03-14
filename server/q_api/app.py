import requests
from flask import Flask, request, render_template, url_for
import argparse
import random
import os
import re
import json
import linecache
from transformers import pipeline, set_seed
from transformers import BertTokenizer, BertForNextSentencePrediction
import nltk
from nltk import tokenize
import ssl
import torch
import sqlalchemy as db
from sqlalchemy.sql import text as QueryText
from dotenv import load_dotenv
import openai
load_dotenv()

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertForNextSentencePrediction.from_pretrained('bert-base-uncased', return_dict=True)

#Local storage of the conversation data - will be deprecated once the database is in place
SQL_URL = "{dbconnection}+pymysql://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"), dbusername=os.environ.get("DB_USERNAME"), dbpassword=os.environ.get("DB_PASSWORD"), dbhost=os.environ.get("DB_HOST"), dbname=os.environ.get("DB_DATABASE"))

ENGINE = db.create_engine(SQL_URL)

print("Connected successfully!")

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt')

# To run this, type in terminal: `export FLASK_APP=main-app.py` (or whatever name of file is)
# Then type flask run
# Additional options: Use `flask run --host=0.0.0.0` or any other host you want to specify.
# additionally you can add `--port=4000` after the previous command to run on port 4000
app = Flask(__name__)

generator = pipeline('text-generation', model='gpt2')

openai.api_key = os.environ.get("OPENAI_API_KEY")

Service_Active = True
API = "GPT-3"

def generate_prompt(new_q, new_a, avatar_id, api):
    
    statement = QueryText("""
SELECT questions.question, video.answer AS latest_question_answer 
FROM video
INNER JOIN videos_questions_streams
ON videos_questions_streams.id_video = video.id_video
INNER JOIN questions
ON questions.id = videos_questions_streams.id_question
WHERE toia_id = :avatar_id 
AND questions.trigger_suggester = 1
ORDER BY video.idx DESC LIMIT 1;
        """)
    CONNECTION = ENGINE.connect()  #Need to refresh connection
    result_proxy = CONNECTION.execute(statement, avatar_id=avatar_id)
    result_set = result_proxy.fetchall()
    
    if api == "GPT-2":      
        prompt = new_q + " " + new_a
        if len(result_set) > 0:
            prompt = """{} {} {}""".format(
                result_set[0][0],
                result_set[0][1],
                prompt)
        
    elif api == "GPT-3":
        prompt = """Suggest five plausible questions.
{}
Q: {}
A: {}
Possible questions:
"""
        if len(result_set) == 0:
            prompt = prompt.format("", new_q, new_a)
        else:
            prompt = prompt.format(
"""
Q: {}
A: {}""".format(result_set[0][0], result_set[0][1]),
                new_q, new_a)

    return prompt

    
@app.route('/getTrial')
def hello():
    return "Successful getTrial"

@app.route('/postTrial', methods = ['POST'])
def test():
    data = request.data
    return ("Success you sent me: ", data)

@app.route('/activate')
def activate_service():
    global Service_Active
    Service_Active = True
    return "Activated!"

@app.route('/deactivate')
def deactivate_service():
    global Service_Active
    Service_Active = False
    return "Deactivated!"

@app.route('/status')
def service_status():
    if Service_Active:
        return "Service is active"
    else:
        return "Service is not active"

@app.route('/useGPT2')
def activate_gpt2():
    global API
    API = "GPT-2"
    return "Using GPT-2 API."

@app.route('/useGPT3')
def activate_gpt3():
    global API
    API = "GPT-3"
    return "Using GPT-3 API."

@app.route('/generationAPI')
def api_status():
    return "Generator is using {} API.".format(API)

@app.route('/generateNextQ',  methods = ['POST'])
def generateNextQ(api=API):
    if not Service_Active:
        return {"error":"Inactive"}

    body_unicode = request.data.decode('utf-8')
    body = json.loads(body_unicode)

    print("Received body", body)
    #### Delete after integration with backend ##############
    text=body['qa_pair']  
    new_q, new_a = nltk.tokenize.sent_tokenize(text)  
    n_suggestions = 5
    avatar_id = 1
    #########################################################

    #### Uncomment after integration with backend ####
    # new_q = body['new_q']  
    # new_a = body['new_a']  
    # n_suggestions = body['n_suggestions']  
    # avatar_id = body['avatar_id']  
    ##################################################
    callback_url = None
    if 'callback_url' in body:
        callback_url = body['callback_url']

    prompt = generate_prompt(
        new_q=new_q, 
        new_a=new_a, 
        avatar_id=avatar_id,
        api=API)
    
    if api == "GPT-2":
        q = generator(prompt, 
                  num_return_sequences=n_suggestions, 
                  max_length=50 + len(prompt))

        #all generated examples 
        allGenerations = ""
        for i in range(n_suggestions):
            allGenerations = allGenerations + " " + q[i]['generated_text'][len(text) - 4:]

        #Separating all the sentences... 
        sentenceList = nltk.tokenize.sent_tokenize(allGenerations)

        #Filter out questions 
        questionsList = []
        for sentence in sentenceList :
            if "?" in sentence:
                questionsList.append(sentence.strip("\n").strip("\\").strip('"'))

        #Bert evaluation
        bert_filtered_qs = []
        for sentence in questionsList:
            encoding = tokenizer(" ".join(storage[-3:]), sentence, return_tensors='pt')
            outputs = model(**encoding)
            logits = outputs.logits
            bert_filtered_qs.append((logits[0,0].item(), sentence))

        bert_filtered_qs.sort(key=lambda tup: tup[0], reverse=True)
        # Update number of suggestions in case there are less than n_suggestion questions identified
        n_suggestions = min(len(bert_filtered_qs) - 1, n_suggestions)
        suggestions = [bert_filtered_qs[i][1] for i in range(n_suggestions) if bert_filtered_qs[i][1] != bert_filtered_qs[i + 1][1]]     
        
    elif api == "GPT-3":      
        response = openai.Completion.create(
            engine="text-davinci-001",
            prompt=prompt,
            temperature=0.7,
            max_tokens=250
        )
        
        generation = response.choices[0]['text']
        # remove new lines, numbered lists, or - lists.
        generation = re.sub(r'\n+[0-9]+.|\n+[0-9]+)|\n+-|\n+ -|\n\n', "", generation)
        # split sentences into list
        suggestions = nltk.tokenize.sent_tokenize(generation)
        # strip trailing white spaces
        suggestions = [suggestion.strip() for suggestion in suggestions]
        
    print(prompt)
    print(suggestions)
    
    ### Uncomment after integration with backend ###
    # return suggestions

    ### Delete after integration
    return suggestions[0]
