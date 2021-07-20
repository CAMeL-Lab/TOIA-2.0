import numpy
import pandas as pd
import numpy as np
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.snowball import SnowballStemmer
from nltk.stem.snowball import SnowballStemmer
import spacy

NLP = spacy.load("en_core_web_lg")
PS = SnowballStemmer('english')


def preprocess(text):
    # Stem and remove stopwords
    text = re.sub('[^a-zA-Z]', ' ', text)
    text = text.lower()
    text = text.split()
    # if not word in set(stopwords.words('english'))]
    text = [PS.stem(word) for word in text]
    return ' '.join(text)


def process_text(text):
    """
    This is different way of preprocessing. at some point need to merge
    """
    doc = NLP(text.lower())
    result = []
    for token in doc:
        if token.text in NLP.Defaults.stop_words:
            continue
        if token.is_punct:
            continue
        if token.lemma_ == '-PRON-':
            continue
        result.append(token.lemma_)
    return " ".join(result)


def calculate_similarity(text1, text2):
    base = NLP(process_text(text1))
    compare = NLP(process_text(text2))
    return base.similarity(compare)



def toia_answer(query, dataset, k=1):
    doc = NLP(query)
    # if Greeting, greet
    if ['INTJ', 'UH'] in [[token.pos_, token.tag_] for token in doc]:    
        if df_greetings.shape[0] > 0:
            answers = dataset[dataset['type'] == "greeting"].sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0]
        else:
            df_noanswers = dataset[dataset['type'] == "no-answer"]
            if df_noanswers.shape[0] > 0:
                answers = df_noanswers.sample(n=1)
                return answers['answer'].values[0], answers['id_video'].values[0], "Record some reetings"
            else:
                return "You haven't recorded greetings nor no-answers", "204", "No Content"

    querycorpus = []
    for i in range(0, len(dataset)):
        userquestion = preprocess(dataset['question'][i])
        querycorpus.append(userquestion)

    # Creating the Bag of Words model with TFIDF and calc cosine_similarity
    vectorizer = CountVectorizer(decode_error="replace")
    # this is needed to get the attribute vocabulary_
    vec_train = vectorizer.fit_transform(querycorpus)
    training_vocabulary = vectorizer.vocabulary_
    transformer = TfidfTransformer()
    trainingvoc_vectorizer = CountVectorizer(
        decode_error="replace", vocabulary=training_vocabulary)
    tfidf_querycorpus = TfidfVectorizer().fit_transform(querycorpus)

    tfidf_userquestion = transformer.fit_transform(
        trainingvoc_vectorizer.fit_transform(
            numpy.array([
                preprocess(query)
            ])))
    cosine_similarities = cosine_similarity(tfidf_userquestion, tfidf_querycorpus)
    related_docs_indices = (-cosine_similarities[0]).argsort()
    sorted_freq = cosine_similarities[0][related_docs_indices]

    # note for this distance the problem we had befor with inf, we have now with 0. Again we decide
    # to make the prediction a bit random. This could be adjusted to remove any 0 distance and
    # pick the only ones left if any, and if none predict 1.

    if sum(sorted_freq) == 0:
        df_noanswers = dataset[dataset['type'] == "no-answer"]
        if df_noanswers.shape[0] > 0:
            answers = df_noanswers.sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], "tfidf all sim 0"
        else:
            return "You haven't recorded no-answers", "204", "No Content"
    elif sorted_freq[0] > 0.7:  #(the top sorted freq is the max)
        if sorted_freq[k-1] != sorted_freq[k] or sorted_freq[k-1] == sorted_freq[k] == 0:
            selected = related_docs_indices[:k]
            return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video'], f"tfidf sim: {sorted_freq[:k]}"
        else:
            indeces = numpy.where(numpy.roll(sorted_freq, 1) != sorted_freq)
            selected = related_docs_indices[:indeces[0][indeces[0] >= k][0]]
            return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video'], f"tfidf sim: {sorted_freq[:k]}"

    else:
        docs = NLP.pipe(dataset['question'].values)
        cosine_similarities = [calculate_similarity(query, doc.text) for doc in docs]
        if max(cosine_similarities) > 0.5:
            related_docs_indices = np.argsort(cosine_similarities)[::-1]
            selected = related_docs_indices[:k][0]
            return dataset.iloc[selected]['answer'], dataset.iloc[selected]['id_video'], f"spaCy sim: {cosine_similarities[selected]}"
        else:
            df_noanswers = dataset[dataset['type'] == "no-answer"]
            if df_noanswers.shape[0] > 0:
                answers = df_noanswers.sample(n=1)
                return answers['answer'].values[0], answers['id_video'].values[0], "spaCy sim below thr"
            else:
                return "You haven't recorded no-answers", "204", "No Content"
