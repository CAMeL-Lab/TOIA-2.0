from dotenv import dotenv_values
import os
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
import nltk
# import spacy
import pandas as pd
import numpy as np
import time
import json

openai.api_key = os.environ.get("OPENAI_API_KEY")

ADA_VECTOR_LENGTH=1024

def json_loads_with_null(val):
    if (val == None):
        # return None
        return [0 for i in range(ADA_VECTOR_LENGTH)]
    else:
        return json.loads(val)


#  Shortlisting using ada-similarity between query and avatar questions
def getFirstNSimilar(df_avatar, query, NUM_SHORTLIST):
    final_suggestions = []

    # Convert from text to vector
    df_avatar['ada_search'] = df_avatar['ada_search'].apply(json_loads_with_null)

    # If conversation has not started, assume it starts with hello
    if query == "" or query == " ":  
        query = "Hello"
    
    df_response = getFreqByCosineSimilarity(query, df_avatar)

    if len(df_response["question"].values) <= NUM_SHORTLIST:
        final_suggestions = df_response["question"].values
    else:
        final_suggestions = df_response["question"].values[:NUM_SHORTLIST]
    return final_suggestions

def getFreqByCosineSimilarity(query, data):
    # Creating embedding for query
    data['combined'] = "Question: " + data.question.str.strip() + "; Answer: " + data.answer.str.strip()
    embedding = get_embedding(query, engine='text-search-ada-query-001')

    # Searching query embedding through avatar's questions' embeddings using cosine similarity
    data['similarities'] = data.ada_search.apply(lambda x: cosine_similarity(x, embedding))
    df_response = data.sort_values('similarities', ascending=False)

    return df_response;