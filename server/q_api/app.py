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
import logging
from utils import getFirstNSimilar
import pandas as pd
import time
load_dotenv()

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertForNextSentencePrediction.from_pretrained('bert-base-uncased', return_dict=True)
NUM_SHORTLIST = 50 #Shortlisting avatar questions for GPT-3

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

def getYNQuestions(entry):
    return entry.question

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
                            ORDER BY video.idx DESC LIMIT 2;
                """)

    CONNECTION = ENGINE.connect()  #Need to refresh connection
    result_proxy = CONNECTION.execute(statement, avatar_id=avatar_id)
    result_set = result_proxy.fetchall()
    
    if api == "GPT-2":      
        prompt = new_q + " " + new_a
        if len(result_set) > 1:
            prompt = """{} {} {}""".format(
                result_set[1][0],
                result_set[1][1],
                prompt)
        
    elif api == "GPT-3":
        prompt = """
Suggest five plausible questions for following up the conversation.
{}
Q: {}
A: {}
Possible questions:"""
        if len(result_set) <= 1:
            prompt = prompt.format("", new_q, new_a)
        else:
            prompt = prompt.format("""
Q: {}
A: {}""".format(result_set[1][0], result_set[1][1]),
                new_q, new_a)

    return prompt

def generate_prompt_for_smart_questions(new_q, new_a, avatar_id, api, suggestions_shortlist, num_questions=5):
    
    
    prompt=""
    if api == "GPT-3":
        prompt = """\
Understand the following conversation:
Q: {}
A: {}""".format(new_q, new_a)
        
        prompt = prompt + "\n\nSelect the {} best follow-up questions from the following:".format(num_questions)
        for question in suggestions_shortlist:
            prompt = prompt + "\n" + question.strip().replace('\n','')
        prompt = prompt +"\n\n"

    # print("=====Prompt=====\n",prompt)
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
    # text=body['qa_pair']
    # new_q, new_a = nltk.tokenize.sent_tokenize(text)
    # n_suggestions = 5
    # avatar_id = 1
    #########################################################

    #### Uncomment after integration with backend ####
    new_q = body['new_q']
    new_a = body['new_a']
    n_suggestions = body['n_suggestions']
    avatar_id = body['avatar_id']
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
            allGenerations = allGenerations + " " + q[i]['generated_text'][len(prompt) - 4:]

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
            encoding = tokenizer(" ".join([new_q, new_a]), sentence, return_tensors='pt')  #[new_q, new_a] was initially [A, Q, A] using storage[-3:]
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
        # split sentences into list
        suggestions = nltk.tokenize.sent_tokenize(generation)

        # Filter suggestions
        suggestions = list(map(lambda suggestion: suggestion.strip(), suggestions))
        # Remove suggestions starting with "A:"
        suggestions = list(filter(lambda suggestion: suggestion[:2] != "A:", suggestions))

        # numbered lists, or - lists.
        reg = re.compile(r"^([0-9]*\.|[0-9]*\)|[a-z]*[\.)]|-|Q:|Possible questions: Q:)", re.MULTILINE)

        suggestions = list(map(lambda suggestion: re.sub(reg, "", suggestion), suggestions))

#         # remove new line
#         generation = generation.replace('\n', ' ').replace('\r', '').strip()

#         # Remove - if any
#         def removeHyphen(suggestion):
#             if suggestion[:1] == '-':
#                 return suggestion[1:len(suggestion)]
#             else:
#                 return suggestion
#         suggestions = list(map(removeHyphen, suggestions))

        # strip trailing white spaces
        suggestions = [suggestion.strip() for suggestion in suggestions]

    if (n_suggestions and n_suggestions > 0 and len(suggestions) > n_suggestions):
        suggestions = random.sample(suggestions, n_suggestions)

    print(prompt)
    if len(suggestions):
        print(suggestions)
    else:
        logging.warning("No suggestions!")

    if callback_url is not None:
        for suggestion in suggestions:
            try:
                requests.post(callback_url, json={"q": suggestion})
            except:
                logging.error("Error when sending suggestions to server. Is the server running?")
    else:
        logging.warning("No callback_url provided!")

    return {"suggestions": json.dumps(suggestions)}

# Generating Smart Questions
@app.route('/generateSmartQ', methods=['POST'])
def generateSmartQ(api=API):
    print("HERE!")
    start_time = time.time() #timing for logs
    if not Service_Active:
        return {"error":"Inactive"}

    body_unicode = request.data.decode('utf-8')
    body = json.loads(body_unicode)


    new_q = body['new_q']
    new_a = body['new_a']
    n_suggestions = body['n_suggestions']
    avatar_id = body['avatar_id']

    stream_id = body['stream_id']
    print("params", new_q, "and", new_a)


    # Get all questions answered by avatar
    statement = QueryText("""SELECT videos_questions_streams.id_stream as stream_id_stream, videos_questions_streams.ada_search, videos_questions_streams.type, questions.question, video.id_video, video.toia_id, video.idx, video.private, video.answer, video.likes, video.views FROM video
                            INNER JOIN videos_questions_streams ON videos_questions_streams.id_video = video.id_video
                            INNER JOIN questions ON questions.id = videos_questions_streams.id_question
                            WHERE videos_questions_streams.id_stream = :streamID AND video.private = 0
                            AND questions.id NOT IN (19, 20)
                            AND questions.suggested_type IN ("answer", "y/n-answer");""")

    print("A")
    CONNECTION = ENGINE.connect()
    result_proxy = CONNECTION.execute(statement,streamID=stream_id)
    result_set = result_proxy.fetchall()
    # Take out all questions in the y_n_answers array

    df_avatar = pd.DataFrame(result_set,
                                columns=[
                                    'stream_id_stream',
                                    'ada_search',
                                    'type',
                                    'question',
                                    'id_video',
                                    'toia_id',
                                    'idx',
                                    'private',
                                    'answer',
                                    # 'language',
                                    'likes',
                                    'views',
                                ])

    # Get shortlisting through ada_similarity
    print("B")
    suggestions_shortlist = getFirstNSimilar(df_avatar, new_q, NUM_SHORTLIST)
    print("C")

    # Alternative: To use all questions without shortlisting, uncomment the following line:
    # suggestions_shortlist = df_avatar["question"].values

    callback_url = None
    if 'callback_url' in body:
        callback_url = body['callback_url']

    prompt = generate_prompt_for_smart_questions(
        new_q=new_q, 
        new_a=new_a, 
        avatar_id=avatar_id,
        api=API,
        suggestions_shortlist=suggestions_shortlist,
        num_questions=5)
    print("q-api/generateSmartQ:prompt:\n%s \n==================" % prompt, flush=True)
    
    if api == "GPT-2":
        q = generator(prompt, 
                  num_return_sequences=n_suggestions, 
                  max_length  = 50 + len(prompt))

        #all generated examples 
        allGenerations = ""
        for i in range(n_suggestions):
            allGenerations = allGenerations + " " + q[i]['generated_text'][len(prompt) - 4:]

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
            encoding = tokenizer(" ".join([new_q, new_a]), sentence, return_tensors='pt')  #[new_q, new_a] was initially [A, Q, A] using storage[-3:]
            outputs = model(**encoding)
            logits = outputs.logits
            bert_filtered_qs.append((logits[0,0].item(), sentence))

        bert_filtered_qs.sort(key=lambda tup: tup[0], reverse=True)
        # Update number of suggestions in case there are less than n_suggestion questions identified
        n_suggestions = min(len(bert_filtered_qs) - 1, n_suggestions)
        suggestions = [bert_filtered_qs[i][1] for i in range(n_suggestions) if bert_filtered_qs[i][1] != bert_filtered_qs[i + 1][1]]     
        
    elif api == "GPT-3":      
        # print("Checkpoint 3: Sending request to AI...")
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            temperature=0,
            max_tokens=250,
        )
        
        generation = response.choices[0]['text']

        # split sentences into list
        suggestions = nltk.tokenize.sent_tokenize(generation)


        # Filter suggestions
        suggestions = list(map(lambda suggestion: suggestion.strip(), suggestions))
        # Remove suggestions starting with "A:"
        suggestions = list(filter(lambda suggestion: suggestion[:2] != "A:", suggestions))

        # numbered lists, or - lists.
        reg = re.compile(r"^([0-9]*\.|[0-9]*\)|[a-z]*[\.)]|-|Q:|Possible questions: Q:)", re.MULTILINE)

        suggestions = list(map(lambda suggestion: re.sub(reg, "", suggestion), suggestions))

        # strip trailing white spaces
        suggestions = [suggestion.strip() for suggestion in suggestions]

    if (n_suggestions and n_suggestions > 0 and len(suggestions) > n_suggestions):
        suggestions = random.sample(suggestions, n_suggestions)


    # print(prompt)
    if len(suggestions):
        print(suggestions)
    else:
        logging.warning("No suggestions!")

    if callback_url is not None:
        for suggestion in suggestions:
            try:
                requests.post(callback_url, json={"q": suggestion})
            except:
                logging.error("Error when sending suggestions to server. Is the server running?")
    else:
        logging.warning("No callback_url provided!")


    # If GPT-3 did not return any values, use the last 7 questions from the shortlist
    if suggestions == []:
        print("q-api/generateSmartQ: GPT-3 returned empty array. Using arbitrarily chosen questions from avatar as suggestions")
        if len(suggestions_shortlist) <= 7:
            suggestions = suggestions_shortlist.tolist()
        else:
            suggestions = suggestions_shortlist[:7].tolist()
    
    end_time = time.time()
    print("q-api/generateSmartQ: Total time taken to get smart suggestions: %s " % (end_time-start_time), flush=True)

    # Get video url of each question as well
    # Security issue
    suggestions_length = len(suggestions)
    

    query_dict = {
        "streamID": stream_id
    }
    suggestions_tuple = "(" + ",".join([' :' + str(i) + ' ' for i in range(suggestions_length)]) + ")"
    for i in range(suggestions_length):
        query_dict[str(i)] = suggestions[i]

    statement = QueryText(f"""SELECT questions.question, videos_questions_streams.id_video as url, video.answer, video.duration_seconds FROM questions 
                            INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id
                            INNER JOIN video ON video.id_video = videos_questions_streams.id_video
                            WHERE videos_questions_streams.id_stream = :streamID
                            AND questions.question IN {suggestions_tuple}
                            AND questions.id NOT IN (19, 20) 
                            AND questions.suggested_type IN ("answer", "y/n-answer");""")
                            # Last two lines are redundant (questions.id and questions.suggested_type conditions)
    
    result_proxy = CONNECTION.execute(statement,query_dict)
    result_set = result_proxy.fetchall()

    print(result_set)

    suggestions_result =  [{"question": row.question, "url": row.url, "answer": row.answer, "duration_seconds": row.duration_seconds} for row in result_set]
    end_time = time.time()
    print("q-api/generateSmartQ:Total time taken to get smart suggestions with appropriate information: %s " % (end_time-start_time), flush=True)

    return {"suggestions": json.dumps(suggestions_result)}

    # return {"suggestions": json.dumps(suggestions)}