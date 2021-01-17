import json
from flask import Flask, request
from haystack.document_store.memory import InMemoryDocumentStore
from haystack.retriever.dense import EmbeddingRetriever
from haystack.utils import print_answers
import pandas as pd
import numpy as np
import pickle

model_path = "deepset/sentence_bert"

infile = open("./faiss_indices/margarita.pkl",'rb')
document_store = pickle.load(infile)
infile.close()

retriever = EmbeddingRetriever(document_store=document_store, 
                               embedding_model=model_path, 
                               use_gpu=False)

app = Flask(__name__)

@app.route('/dialogue_manager', methods=['POST'])

def dialogue_manager():
    if request.method == 'POST':
        raw_data = request.get_json()
        query = raw_data['query']
        if query is None:
            return 'Please enter a query', 400
        
        query_embedding = np.array(
            retriever.embed_queries(texts=query)
        )
        response = document_store.query_by_embedding(
            query_embedding, 
            top_k=1, 
            return_embedding=False
        )
        answer = response[0].meta['answer']
        id_video = response[0].meta['id_video']
        result = {
            'answer': answer,
            'id_video': id_video

        }
        json.dumps(result)
        return result


if __name__ == '__main__':
    app.run()