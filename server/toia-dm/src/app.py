from flask import Flask, request
import json
import sqlalchemy as db
from sqlalchemy.sql import text
import pandas as pd
import numpy as np
import os
from utils import preprocess, toia_answer
from dotenv import load_dotenv

load_dotenv()

if os.environ["ENVIRONMENT"]=="development":
    SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))
    ENGINE = db.create_engine(SQL_URL)

elif os.environ["ENVIRONMENT"]=="production":

    ENGINE = sqlalchemy.create_engine(
        # Equivalent URL:
        # mysql+pymysql://<db_user>:<db_pass>@/<db_name>?unix_socket=<socket_path>/<cloud_sql_instance_name>
        sqlalchemy.engine.url.URL.create(
            drivername=os.environ.get("DB_CONNECTION"),
            username=os.environ.get("DB_USERNAME"),  # e.g. "my-database-user"
            password=os.environ.get("DB_PASSWORD"),  # e.g. "my-database-password"
            database=os.environ.get("DB_DATABASE"),  # e.g. "my-database-name"
            query={
                "unix_socket": "/cloudsql/{}".format(
                    db_socket_dir,  # e.g. "/cloudsql"
                    os.environ.get("DB_INSTANCE_CONNECTION_NAME"))  # i.e "<PROJECT-NAME>:<INSTANCE-REGION>:<INSTANCE-NAME>"
            }
        ),
        **db_config
    )


CONNECTION = ENGINE.connect()
METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

app = Flask(__name__)


@app.route('/dialogue_manager', methods=['GET'])

def dialogue_manager():
    if request.method == 'GET':
        raw_data = request.get_json()
        query = raw_data['query']
        avatar_id = raw_data['avatar_id']
        stream_id = raw_data['stream_id']

        print(query)
        print(avatar_id)
        print(stream_id)

        statement = text(f"""SELECT stream_has_video.stream_id_stream, video.* 
            FROM video 
            INNER JOIN stream_has_video 
            ON video.id_video = stream_has_video.video_id_video 
            WHERE stream_id_stream = {stream_id}
            AND toia_id = {avatar_id}
            AND private = 0
            AND type NOT IN ('filler', 'exit');""")

        result_proxy = CONNECTION.execute(statement)
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
    app.run()
