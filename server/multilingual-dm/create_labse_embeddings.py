"""
This file is no longer being used. 
In the case that embeddings need to be generated manually, this script can be used.
Embeddings are now created on the fly in main.py
"""

import os
from dotenv import dotenv_values
import pandas as pd
import numpy as np
import sqlalchemy as db
from sqlalchemy.sql import text as sql_text
import argparse
import time

import labse
import tensorflow as tf

parser = argparse.ArgumentParser(
    description='Pass toia_id to insert embeddings into the db.')
parser.add_argument('-t', type=int, nargs='+',
                    help='toia_ids for creating embeddings and insert them into the db')
args = parser.parse_args()

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

def adaSearch(x):
    return labse.normalization(labse.encoder(labse.preprocessor(tf.constant([x])))["default"]).numpy()[0].tolist()


def addAdaSearch(toiaID):
    retrieve_statement = sql_text("""
        SELECT v.toia_id, q.question, v.answer, v.id_video, q.id as question_id FROM video v
        INNER JOIN videos_questions_streams vqs ON vqs.id_video = v.id_video
        INNER JOIN questions q ON q.id = vqs.id_question
        WHERE v.toia_id = :toiaID AND v.private = 0 AND vqs.type NOT IN ('filler', 'exit');""")
    CONNECTION = ENGINE.connect()
    result_proxy = CONNECTION.execute(retrieve_statement, toiaID=toiaID)
    result_set = result_proxy.fetchall()
    df_avatar = pd.DataFrame(result_set,
                             columns=[
                                 'toia_id',
                                 'question',
                                 'answer',
                                 'id_video',
                                 'question_id'
                             ])
    df_avatar['combined'] = df_avatar.question.str.strip() + \
        " " + df_avatar.answer.str.strip()
    
    # This will take just under 2 minutes
    df_avatar['ada_search'] = df_avatar.combined.apply(lambda x: adaSearch(x))

    for videoID in df_avatar.id_video:
        adaSearchVar = str(
            df_avatar[df_avatar['id_video'] == videoID].ada_search.values[0])
        update_statement = sql_text("""
        UPDATE videos_questions_streams vqs SET ada_search = :adaSearchVal
        WHERE vqs.id_video = :videoID;
        """)
        CONNECTION = ENGINE.connect()
        CONNECTION.execute(
            update_statement, adaSearchVal=adaSearchVar, videoID=videoID, toiaID=toiaID)


if __name__ == "__main__":
    for toiaID in args.t:
        addAdaSearch(toiaID)
