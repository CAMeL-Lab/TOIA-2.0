from flask import Flask, request
import json
import sqlalchemy as db
import pandas as pd
from utils import preprocess, toia_answer

SQL_URL = "mysql+mysqlconnector://root@localhost/toia"
ENGINE = db.create_engine(SQL_URL)
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

        avatar_kb = db.select([VIDEOS]).where(
            VIDEOS.columns.toia_id == avatar_id,
            VIDEOS.columns.private == 0
        )

        result_proxy = CONNECTION.execute(avatar_kb)
        result_set = result_proxy.fetchall()

        df_avatar = pd.DataFrame(result_set,
                                 columns=[
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
