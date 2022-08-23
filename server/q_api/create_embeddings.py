import os
from dotenv import dotenv_values
import openai
from openai.embeddings_utils import get_embedding
import pandas as pd
import numpy as np
import sqlalchemy as db
from sqlalchemy.sql import text
import argparse
import json

parser = argparse.ArgumentParser(description='Pass toia_id to insert embeddings into the db.')
parser.add_argument('-t', type=int, nargs='+',
                    help='toia_ids for creating embeddings and insert them into the db')
args = parser.parse_args()

config = dotenv_values()
# openai.organization = config['YOUR_ORG_ID']
openai.api_key = config['OPENAI_API_KEY']

# SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))
SQL_URL = "{dbconnection}+pymysql://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"), dbusername=os.environ.get("DB_USERNAME"), dbpassword=os.environ.get("DB_PASSWORD"), dbhost=os.environ.get("DB_HOST"), dbname=os.environ.get("DB_DATABASE"))
ENGINE = db.create_engine(SQL_URL)
METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

print("Connected successfully!")

# python3 create_embeddings.py -t 8


if __name__ == "__main__":
    for toiaID in args.t:
        print("Id", toiaID)
        retrieve_statement = text("""
        SELECT v.toia_id, q.question, v.answer, v.id_video FROM video v
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
                                        'id_video'
                                    ])
        df_avatar['combined'] = "Question: " + df_avatar.question.str.strip() + "; Answer: " + df_avatar.answer.str.strip()
        # This will take just under 2 minutes
        # df_avatar['ada_similarity'] = df_avatar.combined.apply(lambda x: get_embedding(x, engine='text-similarity-ada-001'))


        df_avatar['ada_search'] = df_avatar.combined.apply(lambda x: get_embedding(x, engine='text-search-ada-doc-001'))

        df_avatar.to_csv("temp.csv")

        print("Hereeee")

        for videoID in df_avatar.id_video:
            print("Doing")

            adaSearch = json.dumps(df_avatar[df_avatar['id_video']==videoID].ada_search.values[0])

            # Note 'AND v.toia_id = :toiaID' should be redundant becasue video ID should be unique already.
            update_statement = text("""
            UPDATE videos_questions_streams vqs SET ada_search = :adaSearch
            WHERE vqs.id_video = :videoID;
            """)
            CONNECTION = ENGINE.connect()
            CONNECTION.execute(update_statement, adaSearch=adaSearch, videoID=videoID)
            print("Done")