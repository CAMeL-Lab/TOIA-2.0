import openai
from openai.embeddings_utils import get_embedding
# import nltk
# import numpy as np

openai.api_key = "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"

def printEmbedding(query):
    embedding = get_embedding(query, engine='text-search-ada-query-001')
    print("====================\nQuery:", query, "\n Embedding:",embedding ,"\n====================")

print("Starting test...", flush=True)

printEmbedding("Hello there!")

printEmbedding("How are you?")