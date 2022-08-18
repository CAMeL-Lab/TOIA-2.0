from dotenv import dotenv_values
import os
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
import nltk
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.feature_extraction.text import TfidfTransformer
# from sklearn.feature_extraction.text import CountVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# import spacy
import pandas as pd
import numpy as np
import time
import json
# from nltk.stem.snowball import SnowballStemmer

# NLP = spacy.load("en_core_web_lg")
# PS = SnowballStemmer('english')

openai.api_key = os.environ.get("OPENAI_API_KEY")

# def preprocess(text):
#     # Stem and remove stopwords
#     text = re.sub('[^a-zA-Z]', ' ', text)
#     text = text.lower()
#     text = text.split()
#     # if not word in set(stopwords.words('english'))]
#     text = [PS.stem(word) for word in text]
#     return ' '.join(text)

# def calculate_similarity(text1, text2):
#     base = NLP(process_text(text1))
#     compare = NLP(process_text(text2))
#     return base.similarity(compare)

# def getFirstNSimilar(dataset, query, NUM_SHORTLIST = 50):
#     querycorpus = []
#     for i in range(0, len(dataset)):
#         userquestion = preprocess(dataset['question'][i])
#         querycorpus.append(userquestion)

#     # Creating the Bag of Words model with TFIDF and calc cosine_similarity
#     vectorizer = CountVectorizer(decode_error="replace")
#     # this is needed to get the attribute vocabulary_
#     vec_train = vectorizer.fit_transform(querycorpus)
#     training_vocabulary = vectorizer.vocabulary_
#     transformer = TfidfTransformer()
#     trainingvoc_vectorizer = CountVectorizer(
#         decode_error="replace", vocabulary=training_vocabulary)
#     tfidf_querycorpus = TfidfVectorizer().fit_transform(querycorpus)

#     tfidf_userquestion = transformer.fit_transform(
#         trainingvoc_vectorizer.fit_transform(
#             np.array([
#                 preprocess(query)
#             ])))
#     cosine_similarities = cosine_similarity(tfidf_userquestion, tfidf_querycorpus)
#     related_docs_indices = (-cosine_similarities[0]).argsort()
#     sorted_freq = cosine_similarities[0][related_docs_indices]

#     # final_suggestions = getFreqByCosineSimilarity(query, dataset, cosine_similarities, related_docs_indices, sorted_freq)
#     selected_shortlist = related_docs_indices[:NUM_SHORTLIST]
#     final_suggestions = dataset.iloc[selected_shortlist]['question']

#     # final_suggestions = []
#     # df_response = getFreqByCosineSimilarity(query, df_avatar)

#     # if len(dataset["question"].values) <= NUM_SHORTLIST:
#     #     final_suggestions = dataset["question"].values
#     # else:
#     #     final_suggestions = dataset["question"].values[:NUM_SHORTLIST]
#     return final_suggestions

# def getFreqByCosineSimilarity(query, dataset, cosine_similarities, related_docs_indices, sorted_freq, NUM):

#     # if sum(sorted_freq) == 0:
#     #     df_noanswers = dataset[dataset['type'] == "no-answer"]
#     #     if df_noanswers.shape[0] > 0:
#     #         answers = df_noanswers.sample(n=1)
#     #         return answers['answer'].values[0], answers['id_video'].values[0], "tfidf all sim 0"
#     #     else:
#     #         return []
#     selected = related_docs_indices[:50]
#     return dataset.iloc[selected]['question']
    
#     # elif sorted_freq[0] > 0.7:  #(the top sorted freq is the max)
#     #     if sorted_freq[k-1] != sorted_freq[k] or sorted_freq[k-1] == sorted_freq[k] == 0:
#     #         selected = related_docs_indices[:k]
#     #         return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video'], f"tfidf sim: {sorted_freq[:k]}"
#     #     else:
#     #         indeces = np.where(np.roll(sorted_freq, 1) != sorted_freq)
#     #         selected = related_docs_indices[:indeces[0][indeces[0] >= k][0]]
#     #         return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video'], f"tfidf sim: {sorted_freq[:k]}"

#     # else:
#     #     docs = NLP.pipe(dataset['question'].values)
#     #     cosine_similarities = [calculate_similarity(query, doc.text) for doc in docs]
#     #     if max(cosine_similarities) > 0.5:
#     #         related_docs_indices = np.argsort(cosine_similarities)[::-1]
#     #         selected = related_docs_indices[:k][0]
#     #         return dataset.iloc[selected]['answer'], dataset.iloc[selected]['id_video'], f"spaCy sim: {cosine_similarities[selected]}"
#     #     else:
#     #         df_noanswers = dataset[dataset['type'] == "no-answer"]
#     #         if df_noanswers.shape[0] > 0:
#     #             answers = df_noanswers.sample(n=1)
#     #             return answers['answer'].values[0], answers['id_video'].values[0], "spaCy sim below thr"
#     #         else:
#     #             return []

#     return df_response;

ADA_VECTOR_LENGTH=1024

def json_loads_with_null(val):
    if (val == None):
        # return None
        return [0 for i in range(ADA_VECTOR_LENGTH)]
    else:
        return json.loads(val)




#  Using ada-similarity
def getFirstNSimilar(df_avatar, query, NUM_SHORTLIST):
    final_suggestions = []

    df_avatar['ada_search'] = df_avatar['ada_search'].apply(json_loads_with_null)
    
    if query == "" or query == " ":  # If conversation has not started, assume it starts with hello
        query = "Hello"
    print("==========Getting similarities============", query)
    
    df_response = getFreqByCosineSimilarity(query, df_avatar)

    # return {"suggestions_shortlist": json.dumps(final_suggestions)}
    print(query, "\tMost similar:", df_response["question"].values[0], df_response.similarities.values[0])
    if len(df_response["question"].values) <= NUM_SHORTLIST:
        final_suggestions = df_response["question"].values
    else:
        final_suggestions = df_response["question"].values[:NUM_SHORTLIST]
    return final_suggestions

def getFreqByCosineSimilarity(query, data):
    data['combined'] = "Question: " + data.question.str.strip() + "; Answer: " + data.answer.str.strip()

    time_temp1 = time.time()
    embedding = get_embedding(query, engine='text-search-ada-query-001')
    time_temp2 = time.time()
    print("--- Time taken to get embedding for single query %ss ---" % (time_temp2-time_temp1))

    data['similarities'] = data.ada_search.apply(lambda x: cosine_similarity(x, embedding))

    time_temp3 = time.time()

    print(data['similarities'])

    print("\n\n\n", type(embedding))


    df_response = data.sort_values('similarities', ascending=False)
    print("--- Time taken for (ada)search %ss ---" % (time_temp3-time_temp2))

    return df_response;