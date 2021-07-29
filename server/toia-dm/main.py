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

app = Flask(__name__)

@app.route('/')

def index():

    result = {
        'answer': 'I am great',
        'id_video': 'Nawaz_31_18_13a37ce6.mp4'
    }

    json.dumps(result)
    return result


@app.route('/dialogue_manager', methods=['GET'])

def dialogue_manager():

    if os.environ.get("ENVIRONMENT")=="development":
        SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))

        ENGINE = db.create_engine(SQL_URL)

    elif os.environ.get("ENVIRONMENT")=="production":

        def getconn() -> pymysql.connections.Connection:
            conn: pymysql.connections.Connection = connector.connect(
                os.environ.get("DB_INSTANCE_CONNECTION_NAME"),
                "pymysql",
                user=os.environ.get("DB_USERNAME"),
                password=os.environ.get("DB_PASSWORD"),
                db=os.environ.get("DB_DATABASE")
            )
            return conn

        ENGINE = db.create_engine(
            "mysql+pymysql://",
            creator=getconn,
        )

    CONNECTION = ENGINE.connect()
    METADATA = db.MetaData()
    VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

    print("Connected successfully!")

    if request.method == 'GET':
        print(request)
        print(request.get_json())

        raw_data = request.get_json()
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

        if query is None:
            return 'Please enter a query', 400

        response = toia_answer(query, df_avatar)

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
