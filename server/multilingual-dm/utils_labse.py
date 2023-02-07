from dotenv import dotenv_values
import pandas as pd
import numpy as np
import os

import tensorflow_hub as hub
import tensorflow as tf
import tensorflow_text as text # Needed for loading universal-sentence-encoder-cmlm/multilingual-preprocess

config = dotenv_values()

preprocessor = hub.KerasLayer(
    "https://tfhub.dev/google/universal-sentence-encoder-cmlm/multilingual-preprocess/2")
encoder = hub.KerasLayer("https://tfhub.dev/google/LaBSE/2")

def normalization(embeds):
    norms = np.linalg.norm(embeds, 2, axis=1, keepdims=True)
    return embeds/norms

def similarity(question_embeds, answer_embeds):
    return np.matmul(question_embeds, np.transpose(answer_embeds))

def toia_answer(query, data, k=1):
    print("Query", query)
    embedding = normalization(encoder(preprocessor(query))["default"])
    print("B")
    data['similarities'] = data.ada_search.apply(lambda x: similarity(embedding, x))
    print("C")
    res = data.sort_values('similarities', ascending=False).head(k)
    print("D")

    ada_similarity_score = res.similarities.values[0]
    print("Similarity Score", ada_similarity_score)
    if ada_similarity_score > 0.29:
        return res['answer'].values[0], res['id_video'].values[0], ada_similarity_score
    else:
        df_noanswers = data[data['type'] == "no-answer"]
        if df_noanswers.shape[0] > 0:
            answers = df_noanswers.sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], ada_similarity_score
        else:
            return "You haven't recorded no-answers", "204", "No Content"