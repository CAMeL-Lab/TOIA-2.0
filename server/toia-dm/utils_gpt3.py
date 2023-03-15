from dotenv import dotenv_values
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
import pandas as pd
import numpy as np
import os
from sqlalchemy.sql import text


config = dotenv_values()
# openai.organization = config['YOUR_ORG_ID']
try:
    openai.api_key = config['OPENAI_API_KEY']
except:
    openai.api_key = os.environ.get("OPENAI_API_KEY")
# openai.Model.list()

print("toia_answer")

# remember to change the interactor_id


def toia_answer(query, data, engine, interactor_id=41, memory=10, minutes=15):
    print("toia_answer")
    print(query)
    embedding = get_embedding(query, engine='text-search-ada-query-001')
    print("API worked")
    data['similarities'] = data.ada_search.apply(
        lambda x: cosine_similarity(x, embedding))
    res = data.sort_values('similarities', ascending=False)

    ada_similarity_scores = res.similarities.values

    # (removed thresholding. Keep every answer)
    if ada_similarity_scores[0] > 0.29:
        # take first 10 answers from the chatlog"
        # connect to the db
        connection = engine.connect()
        # retrieve the video IDs already played. The logic here is
        # to retrieve the top {memory} last logs from the db and take the ones
        # that aren't older than {minutes}
        statement = text(f"""
            SELECT cl.video_played,
                (cl.timestamp - LAG(cl.timestamp, 1) OVER (ORDER BY cl.timestamp)) / 60000 AS time_diff_min
            FROM (SELECT * FROM conversations_log WHERE question_asked != "None") cl
            WHERE cl.interactor_id = {interactor_id}
            ORDER BY cl.timestamp DESC
            LIMIT {memory}
            ;""")
        result_proxy = connection.execute(statement)
        result_set = result_proxy.fetchall()
        # put them in a df
        chatlog = pd.DataFrame(result_set)
        # take cumsum of top minute differences -- only problem to highlith here:
        # WE DON'T HAVE A NOTION OF WHAT TIME IS NOW
        chatlog['cum_time_diff_min'] = chatlog['time_diff_min'].cumsum()

        # define the temp cache of played video IDs -- adding here the notion of NOW: first question of new
        # session is going to be put in the cache regardless. Then if time lag is too long from first and last,
        # the cache is just that. Then it starts populating.
        if chatlog['cum_time_diff_min'][0] >= minutes:
            video_cache = chatlog['video_played'].values[0]
        else:
            video_cache = chatlog[chatlog['cum_time_diff_min']
                                  < minutes]['video_played'].values

        # store outputs (already sorted by decreasing order of retrieval)
        answers = res['answer'].values
        videos = res['id_video'].values
        scores = ada_similarity_scores
        if len(set(video_cache).intersection(set(videos))) > 0:
            next_best_idx = next(x for x, vid in enumerate(
                videos) if vid not in video_cache)
            return answers[next_best_idx], videos[next_best_idx], scores[next_best_idx]
        else:
            return answers[0], videos[0], scores[0]
    else:
        df_noanswers = data[data['type'] == "no-answer"]
        if df_noanswers.shape[0] > 0:
            answers = df_noanswers.sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], ada_similarity_scores[0]
        else:
            return "You haven't recorded no-answers", "204", "No Content"
