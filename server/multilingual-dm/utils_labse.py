from dotenv import dotenv_values
import pandas as pd
import numpy as np
import os
import labse
import tensorflow as tf

config = dotenv_values()


def toia_answer(query, data, k=1):
    print("Query", query)
    embedding = labse.normalization(labse.encoder(labse.preprocessor(tf.constant([query])))["default"]).numpy()[0]
    data['similarities'] = data.ada_search.apply(lambda x: labse.similarity(embedding, x))
    res = data.sort_values('similarities', ascending=False).head(k)
    print("Similarities: ", data.sort_values('similarities', ascending=False).head(15))

    ada_similarity_score = res.similarities.values[0]
    print("Similarity Score", ada_similarity_score)
    if ada_similarity_score > 0.29:
        return res['answer'].values[0], res['id_video'].values[0], res['language'].values[0], ada_similarity_score
    else:
        df_noanswers = data[data['type'] == "no-answer"]
        if df_noanswers.shape[0] > 0:
            answers = df_noanswers.sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], answers['language'].values[0], ada_similarity_score
        else:
            return "You haven't recorded no-answers", "204", None, "No Content"