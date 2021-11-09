from flask import Flask, request
import json
import sqlalchemy as db
from sqlalchemy.sql import text
from google.cloud.sql.connector import connector
import pymysql
import pandas as pd
import numpy as np
import os
from utils import preprocess, toia_answer
from dotenv import load_dotenv

load_dotenv()

if os.environ.get("ENVIRONMENT")=="development":
    SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))

    ENGINE = db.create_engine(SQL_URL)

elif os.environ.get("ENVIRONMENT")=="production":

    ENGINE=db.create_engine("{dbconnection}://{dbusername}:{dbpassword}@/{dbname}?unix_socket=/cloudsql/{dbinstancename}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbname=os.environ.get("DB_DATABASE"),dbinstancename=os.environ.get("DB_INSTANCE_CONNECTION_NAME")))

CONNECTION = ENGINE.connect()
METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

print("Connected successfully!")

app = Flask(__name__)

@app.route('/dialogue_manager', methods=['POST'])

def dialogue_manager():

    if request.method == 'POST':

        raw_data = request.get_json()['params']
        query = raw_data['query']
        avatar_id = raw_data['avatar_id']
        stream_id = raw_data['stream_id']

        print(query)
        print(avatar_id)
        print(stream_id)

        statement = text("SELECT stream_has_video.stream_id_stream,video.* FROM video INNER JOIN stream_has_video ON video.id_video = stream_has_video.video_id_video WHERE stream_has_video.stream_id_stream = :streamID AND video.private = 0 AND video.type NOT IN ('filler', 'exit');")

        result_proxy = CONNECTION.execute(statement,streamID=stream_id)
        result_set = result_proxy.fetchall()

        df_avatar = pd.DataFrame(result_set,
                                 columns=[
                                     'stream_id_stream',
                                     'id_video',
                                     'type',
                                     'toia_id',
                                     'idx',
                                     'private',
                                     'question',
                                     'answer',
                                     'language',
                                     'likes',
                                     'views',
                                 ])
        
        df_greetings = df_avatar[df_avatar['type'] == "greeting"]

        if query is None:
            return 'Please enter a query', 400

        response = toia_answer(query, df_avatar, df_greetings)

        answer = response[0]
        id_video = response[1]

        result = {
            'answer': answer,
            'id_video': id_video

        }

        json.dumps(result)
        return result


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
