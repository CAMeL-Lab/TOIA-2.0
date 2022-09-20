from dotenv import dotenv_values
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
import pandas as pd
import numpy as np
import os

config = dotenv_values()
# openai.organization = config['YOUR_ORG_ID']
try:
    openai.api_key = config['OPENAI_API_KEY']
except:
    openai.api_key = os.environ.get("OPENAI_API_KEY")
# openai.Model.list()


def toia_answer(query, data, k=1):
    embedding = get_embedding(query, engine='text-search-ada-query-001')
    data['similarities'] = data.ada_search.apply(lambda x: cosine_similarity(x, embedding))
    res = data.sort_values('similarities', ascending=False).head(k)

    if res.similarities.values[0] > 0.29:
        return res['answer'].values[0], res['id_video'].values[0], f"""ada_search_sim: {res['similarities'].values[0]}"""
    else:
        df_noanswers = data[data['type'] == "no-answer"]
        if df_noanswers.shape[0] > 0:
            answers = df_noanswers.sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], f"""ada_search_sim: {res['similarities'].values[0]}<=0.29"""
        else:
            return "You haven't recorded no-answers", "204", "No Content"

# def getFirstNSimilar(df_avatar, query, NUM_SHORTLIST):
#     final_suggestions = []

#     df_avatar['combined'] = "Question: " + df_avatar.question.str.strip() + "; Answer: " + df_avatar.answer.str.strip()

#     df_avatar['ada_similarity'] = df_avatar.combined.apply(lambda x: get_embedding(x, engine='text-similarity-ada-001'))
#     df_avatar['ada_search'] = df_avatar.combined.apply(lambda x: get_embedding(x, engine='text-search-ada-doc-001'))

#     if query == "" or query == " ": 
#         query = "Hello"
#     print("==========Getting similarities============", query)
#     df_response = getFreqByCosineSimilarity(query, df_avatar)
#     # return {"suggestions_shortlist": json.dumps(final_suggestions)}
#     print(query, "\tMost similar:", df_response["question"].values[0], df_response.similarities.values[0])
#     if len(df_response["question"].values) <= NUM_SHORTLIST:
#         final_suggestions = df_response["question"].values
#     else:
#         final_suggestions = df_response["question"].values[:NUM_SHORTLIST]
#     return final_suggestions

# def getFreqByCosineSimilarity(query, data):
#     data['combined'] = "Question: " + data.question.str.strip() + "; Answer: " + data.answer.str.strip()
    
#     embedding = get_embedding(query, engine='text-search-ada-query-001')
#     data['similarities'] = data.ada_search.apply(lambda x: cosine_similarity(x, embedding))
#     df_response = data.sort_values('similarities', ascending=False)

#     return df_response;