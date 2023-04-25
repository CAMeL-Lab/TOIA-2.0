import json
import sqlalchemy as db
from sqlalchemy.sql import text
import pandas as pd
import numpy as np
import os
import ast
from sqlalchemy.sql import text as sql_text
import labse

from utils_labse import toia_answer
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import tensorflow as tf

load_dotenv()

SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))


ENGINE = db.create_engine(SQL_URL)

METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

print("Connected successfully!")

app = FastAPI()


class QuestionInput(BaseModel):
    query: str
    avatar_id: str
    stream_id: str

class DMpayload(BaseModel):  #I know this nesting is stupid --- correct this later in the nodejs backend when defining the payload there
    params: QuestionInput

class EmbeddingsInput(BaseModel):
    videoID: str
    question: str
    answer: str

class EmbeddingsPayload(BaseModel):  #I know this nesting is stupid --- correct this later in the nodejs backend when defining the payload there
    params: EmbeddingsInput

def adaSearch(x):
    print("Creating Embeddings...")
    return labse.normalization(labse.encoder(labse.preprocessor(tf.constant([x])))["default"]).numpy()[0].tolist()

@app.post("/dialogue_manager")
def dialogue_manager(payload: DMpayload):
    raw_payload = payload.params
    
    query = raw_payload.query
    avatar_id = raw_payload.avatar_id
    stream_id = raw_payload.stream_id

    print(query)
    print(avatar_id)
    print(stream_id)

    statement = text("""SELECT videos_questions_streams.id_stream as stream_id_stream, videos_questions_streams.type, videos_questions_streams.ada_search, questions.question, video.language, video.id_video, video.toia_id, video.idx, video.private, video.answer, video.likes, video.views FROM video
                            INNER JOIN videos_questions_streams ON videos_questions_streams.id_video = video.id_video
                            INNER JOIN questions ON questions.id = videos_questions_streams.id_question
                            WHERE videos_questions_streams.id_stream = :streamID AND video.private = 0 AND videos_questions_streams.type NOT IN ('filler', 'exit');""")

    CONNECTION = ENGINE.connect()
    result_proxy = CONNECTION.execute(statement,streamID=stream_id)
    result_set = result_proxy.fetchall()

    df_avatar = pd.DataFrame(result_set,
                                columns=[
                                    'stream_id_stream',
                                    'type',
                                    'ada_search',
                                    'question',
                                    'language',
                                    'id_video',
                                    'toia_id',
                                    'idx',
                                    'private',
                                    'answer',
                                    'likes',
                                    'views',
                                ])
    
    vector_length = len(ast.literal_eval(df_avatar['ada_search'].values[0]))

    default_vector = [0 for _ in range(vector_length)]

    df_avatar['ada_search'] = df_avatar.ada_search.apply(lambda x: ast.literal_eval(x) if x is not None else default_vector)  #needed when np array stored as txt
    if query is None:
        return 'Please enter a query', 400

    print("checking for response")
    response = toia_answer(query, df_avatar)

    answer = response[0]
    id_video = response[1]
    language = response[2]
    ada_similarity_score = response[3]

    result = {
        'answer': answer,
        'id_video': id_video,
        'ada_similarity_score': ada_similarity_score,
        'language' : language,
    }

    json.dumps(result)
    return result

@app.post("/generate_embeddings")
def generate_embeddings(payload: EmbeddingsPayload):
    question = payload.params.question
    answer = payload.params.answer
    videoID = payload.params.videoID

    combined = question.strip() + \
    " " + answer.strip()

    embeddings = adaSearch(combined)
    print("Returning embeddings")

    return json.dumps(embeddings)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("DM_PORT")))
