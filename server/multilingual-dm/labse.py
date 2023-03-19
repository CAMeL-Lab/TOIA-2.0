import tensorflow_hub as hub
import tensorflow as tf
# Needed for loading universal-sentence-encoder-cmlm/multilingual-preprocess
import tensorflow_text as text
import numpy as np

preprocessor = hub.KerasLayer(
    "https://tfhub.dev/google/universal-sentence-encoder-cmlm/multilingual-preprocess/2")
encoder = hub.KerasLayer("https://tfhub.dev/google/LaBSE/2")

def normalization(embeds):
    norms = np.linalg.norm(embeds, 2, axis=1, keepdims=True)
    return embeds/norms

def similarity(question_embeds, answer_embeds):
    return np.matmul(question_embeds, np.transpose(answer_embeds))