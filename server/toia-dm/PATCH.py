import numpy as np
import pandas as pd
import sqlalchemy as db
from sqlalchemy import Table
from dotenv import dotenv_values
from sqlalchemy.sql import text
import friendlywords as fw
import json

from create_embeddings import addAdaSearch

config = dotenv_values()

SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(
    dbconnection=config["DB_CONNECTION"],
    dbusername=config["DB_USERNAME"],
    dbpassword=config["DB_PASSWORD"],
    dbhost=config["DB_HOST"],
    dbname=config["DB_DATABASE"])
print(SQL_URL)

print("Connecting...")

ENGINE = db.create_engine(SQL_URL)
METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

print("Connected successfully!")
CONNECTION = ENGINE.connect()

def isAdaAdded(toia_id):
    getAda = text("""SELECT ada_search FROM videos_questions_streams WHERE id_stream in (SELECT id_stream FROM stream WHERE toia_id = :toiaID) AND type NOT IN ('filler', 'exit') LIMIT 1;""")
    result_proxy = CONNECTION.execute(getAda, toiaID=toia_id)
    result_set = result_proxy.fetchall()

    if len(result_set) == 0: 
        return False
    if len(result_set[0][0]) == 0:
        return False
    return True

def populateAllAdaSearch():
    getUsers = text("""SELECT id FROM toia_user""")
    result_proxy = CONNECTION.execute(getUsers)
    result_set = result_proxy.fetchall()
    for result in result_set:
        toia_id, = result
        if not isAdaAdded(toia_id):
            print("Creating Embeddings for toia_id:", toia_id)
            addAdaSearch(toia_id)
        else:
            print("Embedding exists for toia_id:", toia_id)

def createVariants():
    GPT_Suggestions = (2, 4, 5, 7, 8, 9, 12, 13, 14, 17, 18, 19, 20, 21)
    Manual_Suggestions = (23, 25, 26, 28, 29, 32, 36, 37)
    Brainstormed = (22, 24, 27, 30, 31, 35, 38, 39, 40)

    Attentive_Fillers = (1,2,3,4,5)
    Inattentive_Fillers = (6, 7, 8, 9, 10)
    Other_onboarding = (11, 12, 13, 14, 15, 16, 17, 18, 19, 20)

    NumberOfVideos = (30, 60, 9999999999999) # Hardcoding the "all" version here since we don't run this script frequently

    # Tables
    stream_table = Table('stream', METADATA, autoload_with=ENGINE)

    def createStream(user_id, stream_name):
        query = stream_table.insert().values(name=stream_name, toia_id=user_id, private=0, likes=0, views=0)
        result = CONNECTION.execute(query)
        return result.inserted_primary_key[0]
    
    def insertFiller(old_stream_id, new_stream_id, filler): 
        query = text("""INSERT INTO videos_questions_streams(id_video, id_question, id_stream, type, ada_search)
                        SELECT videos_questions_streams.id_video, videos_questions_streams.id_question, :new_stream_id, videos_questions_streams.type, videos_questions_streams.ada_search 
                        FROM `videos_questions_streams` 
                        LEFT JOIN tracker ON tracker.video_id = videos_questions_streams.id_video 
                        WHERE tracker.activity = 'record-video' AND videos_questions_streams.id_stream = :old_stream_id AND videos_questions_streams.id_question IN :filler_ids 
                        ORDER BY tracker.end_time;
                    """)
        CONNECTION.execute(query, new_stream_id=new_stream_id, old_stream_id=old_stream_id, filler_ids=filler)

    def insertOtherOnboarding(old_stream_id, new_stream_id):
        query = text("""INSERT INTO videos_questions_streams(id_video, id_question, id_stream, type, ada_search)
                        SELECT videos_questions_streams.id_video, videos_questions_streams.id_question, :new_stream_id, videos_questions_streams.type, videos_questions_streams.ada_search 
                        FROM `videos_questions_streams` 
                        WHERE videos_questions_streams.id_stream = :old_stream_id AND videos_questions_streams.id_question IN :other_required_ids 
                        ORDER BY videos_questions_streams.id_question;
                    """)
        CONNECTION.execute(query, new_stream_id=new_stream_id, old_stream_id=old_stream_id, other_required_ids=Other_onboarding)

    def insertVideos(old_stream_id, new_stream_id, first_n):
        query = text("""INSERT INTO videos_questions_streams(id_video, id_question, id_stream, type, ada_search)
                        SELECT videos_questions_streams.id_video, videos_questions_streams.id_question, :new_stream_id, videos_questions_streams.type, videos_questions_streams.ada_search 
                        FROM `videos_questions_streams` 
                        WHERE videos_questions_streams.id_stream = :old_stream_id AND videos_questions_streams.type NOT IN ('filler') AND 
                        videos_questions_streams.id_question NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)
                        ORDER BY videos_questions_streams.id_question
                        LIMIT :first_n;""")
        CONNECTION.execute(query, new_stream_id=new_stream_id, old_stream_id=old_stream_id, first_n=first_n)

    def getPrimaryStream(user_id):
        query = text("""SELECT id_stream FROM stream WHERE toia_id = :user_id ORDER BY id_stream""")
        result_proxy = CONNECTION.execute(query, user_id=user_id)
        result_set = result_proxy.fetchall()
        for result in result_set:
            first_id, = result
            return first_id

    info = {
        "Attentive":{},
        "Inattentive":{}
    }

    for n in NumberOfVideos:
        info["Attentive"][n] = []
        info["Inattentive"][n] = []

    def createUserVariant(user_id):
        old_stream_id = getPrimaryStream(user_id)
        # Attentive Fillers
        for n in NumberOfVideos:
            name = fw.generate(1) + "_" + str(user_id)
            new_stream_id = createStream(user_id, name)
            insertFiller(old_stream_id, new_stream_id, Attentive_Fillers)
            insertOtherOnboarding(old_stream_id, new_stream_id)
            insertVideos(old_stream_id, new_stream_id, n)
            info["Attentive"][n] = [*info["Attentive"][n], name]
            print("New Stream: ", new_stream_id, name, "Type: Attentive  N=", n)
        # Inattentive fillers
        for n in NumberOfVideos:
            name = fw.generate(1) + "_" + str(user_id)
            new_stream_id = createStream(user_id, name)
            insertFiller(old_stream_id, new_stream_id, Inattentive_Fillers)
            insertOtherOnboarding(old_stream_id, new_stream_id)
            insertVideos(old_stream_id, new_stream_id, n)
            info["Inattentive"][n] = [*info["Inattentive"][n], name]
            print("New Stream: ", new_stream_id, name, "Type: Attentive  N=", n)
        
    print("GPT Suggestions")
    for x in GPT_Suggestions:
        createUserVariant(x)

    print("Manual Suggestions")
    for x in Manual_Suggestions:
        createUserVariant(x)
    
    print("Brainstormed")
    for x in Brainstormed:
        createUserVariant(x)
    
    with open('result.json', 'w') as fp:
        json.dump(info, fp)

populateAllAdaSearch()
# createVariants()
