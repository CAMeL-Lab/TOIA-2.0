import requests
from flask import Flask, request, render_template, url_for
import os
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

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertForNextSentencePrediction.from_pretrained('bert-base-uncased', return_dict=True)

#Local storage of the conversation data - will be deprecated once the database is in place
storage = []

starters = ["What topics would you like to talk about?", "What are your hobbies?", "Where did you study?"]

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

Service_Active = True

@app.route('/')
def show_page():
    return render_template("index.html")

@app.route('/getTrial')
def hello():
    return "Successful getTrial"

@app.route('/postTrial', methods = ['POST'])
def test():
    data = request.data
    return ("Success you sent me: ", data)

@app.route('/getMandatoryQuestions')
def return3Questions():
    return {"mandatoryQuestions": ["How are you?", "What is your name?", "Where are you from?"]}

    #add priority, add label?

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

@app.route('/generateNextQ',  methods = ['POST'])
def generateNextQ():
    if not Service_Active:
        return {"error":"Inactive"}
    # UNCOMMENT AFTER INTEGRATION WITH BACKEND

    body_unicode = request.data.decode('utf-8')
    body = json.loads(body_unicode)

    print("Received body", body)
    text=body['qa_pair']
    callback_url = None
    if 'callback_url' in body:
        callback_url = body['callback_url']

    storage.append(text)

    question = ''
    if len(starters) > 0:
        print("SENDING STARTER")
        questions = [starters.pop()]

    else:

        text = " ".join(storage[-2:])
        q = generator(text, num_return_sequences=3,max_length=50+len(text))

        #all generated examples
        allGenerations = ""
        for i in range(3):
            allGenerations = allGenerations +" "+ q[i]['generated_text'][len(text)-4:]

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

        # Sort by decending score
        bert_filtered_qs.sort(key=lambda tup: tup[0], reverse=True)


        print(bert_filtered_qs)

        # Set the number of suggestions as minimum between all available and 5. Output max 5 suggestions.
        # but we may have 1-2 duplicates (hence I put 7)
        no_suggestions = min(len(bert_filtered_qs) - 1, 7)
        # TODO: Fix issue -> List index out of range  #Note this happens when there are no suggestions.
        try:
            questions = [
                bert_filtered_qs[i][1] \
                    for i in range(no_suggestions - 1) \
                        if bert_filtered_qs[i][1] != bert_filtered_qs[i + 1][1] \
                        ]
        except:
            print(bert_filtered_qs)
            questions = [""]
    if callback_url is not None:
        try:
            requests.post(callback_url, json={"q": questions})
        except:
            print("Error when sending suggestions to server. Is the server running?")
    
    print(storage)
    
    return {"q": questions[0]}  #For now, it only gives the top-1 suggestion.
                                #Remove [0] when server is updated to process the list.







