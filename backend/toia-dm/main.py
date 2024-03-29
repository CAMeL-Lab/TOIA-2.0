import json
from pydantic.errors import DictError
import sqlalchemy as db
from sqlalchemy.sql import text
from google.cloud.sql.connector import connector
import pandas as pd
import numpy as np
import os
# from utils import toia_answer, NLP, PS
from utils_gpt3 import toia_answer
# from utils_gpt3 import getFirstNSimilar
from dotenv import load_dotenv
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
load_dotenv()

required_env_vars = [
    "ENVIRONMENT",
    "API_URL",
    "DB_CONNECTION",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_DATABASE",
    "DM_PORT",
    "OPENAI_API_KEY"
]

for env_var in required_env_vars:
    if not os.environ.get(env_var):
        raise Exception(f"Missing environment variable {env_var}")


ALLOWED_HOSTS = ["*"]
if os.environ.get("ENVIRONMENT") == "production":
    ALLOWED_HOSTS = [os.environ.get("API_URL")]

SQL_URL = "{dbconnection}://{dbusername}:{dbpassword}@{dbhost}/{dbname}".format(dbconnection=os.environ.get("DB_CONNECTION"),dbusername=os.environ.get("DB_USERNAME"),dbpassword=os.environ.get("DB_PASSWORD"),dbhost=os.environ.get("DB_HOST"),dbname=os.environ.get("DB_DATABASE"))


ENGINE = db.create_engine(SQL_URL)

METADATA = db.MetaData()
VIDEOS = db.Table('video', METADATA, autoload=True, autoload_with=ENGINE)

print("Connected successfully!")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionInput(BaseModel):
    query: str
    avatar_id: str
    stream_id: str

class DMpayload(BaseModel):  #I know this nesting is stupid --- correct this later in the nodejs backend when defining the payload there
    params: QuestionInput

@app.post("/dialogue_manager")
def dialogue_manager(payload: DMpayload):
    raw_payload = payload.params
    
    query = raw_payload.query
    avatar_id = raw_payload.avatar_id
    stream_id = raw_payload.stream_id

    print(query)
    print(avatar_id)
    print(stream_id)

    statement = text("""SELECT videos_questions_streams.id_stream as stream_id_stream, videos_questions_streams.type, videos_questions_streams.ada_search, questions.question, video.id_video, video.toia_id, video.language, video.idx, video.private, video.answer, video.likes, video.views FROM video
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
                                    'id_video',
                                    'toia_id',
                                    'language',
                                    'idx',
                                    'private',
                                    'answer',
                                    'likes',
                                    'views',
                                ])

    df_avatar['ada_search'] = df_avatar.ada_search.apply(eval).apply(np.array)  #needed when np array stored as txt

    # df_greetings = df_avatar[df_avatar['type'] == "greeting"]

    if query is None:
        raise HTTPException(status_code=400, detail="Please enter a query")
        # return 'Please enter a query', 400

    response = toia_answer(query, df_avatar)

    print(response)

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("DM_PORT")))
