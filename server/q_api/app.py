from flask import Flask, request, render_template, url_for
import os
import argparse
import random
import os 
import re
import json 
import linecache
from transformers import pipeline, set_seed
import nltk 
from nltk import tokenize
#nltk.download('punkt')

# To run this, type in terminal: `export FLASK_APP=main-app.py` (or whatever name of file is)
# Then type flask run
# Additional options: Use `flask run --host=0.0.0.0` or any other host you want to specify.
# additionally you can add `--port=4000` after the previous command to run on port 4000
app = Flask(__name__)

generator = pipeline('text-generation', model='gpt2')

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
      
@app.route('/generateNextQ',  methods = ['POST'])
def generateNextQ():

    
    #text = "How are you? What would you like to talk about? Do you like watching soccer games? "

    # UNCOMMENT AFTER INTEGRATION WITH BACKEND
    text = request.data

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
            questionsList.append(sentence)


    return {"q":questionsList}



    


    