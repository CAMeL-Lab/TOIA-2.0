import numpy
import pandas as pd
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.snowball import SnowballStemmer
from nltk.stem.snowball import SnowballStemmer
import spacy

NLP = spacy.load("en_core_web_sm")
PS = SnowballStemmer('english')


def preprocess(text):
    # Stem and remove stopwords
    text = re.sub('[^a-zA-Z]', ' ', text)
    text = text.lower()
    text = text.split()
    # if not word in set(stopwords.words('english'))]
    text = [PS.stem(word) for word in text]
    return ' '.join(text)


def toia_answer(query, dataset, k=1):
    doc = NLP(query)
    # if Greeting, greet
    if ['INTJ', 'UH'] in [[token.pos_, token.tag_] for token in doc]:
        answers = dataset[dataset['type'] == "greeting"].sample(n=1)
        return answers['answer'].values[0], answers['id_video'].values[0]

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
    cosine_similarities = cosine_similarity(
        tfidf_userquestion, tfidf_querycorpus)
    related_docs_indices = (-cosine_similarities[0]).argsort()
    sorted_freq = cosine_similarities[0][related_docs_indices]

    # note for this distance the problem we had befor with inf, we have now with 0. Again we decide
    # to make the prediction a bit random. This could be adjusted to remove any 0 distance and
    # pick the only ones left if any, and if none predict 1.

    if sum(sorted_freq) == 0:
        answers = dataset[dataset['type'] == "no-answer"].sample(n=1)
        return answers['answer'].values[0], answers['id_video'].values[0]

    elif sorted_freq[k-1] != sorted_freq[k] or sorted_freq[k-1] == sorted_freq[k] == 0:
        selected = related_docs_indices[:k]

        return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video']
    else:
        indeces = numpy.where(numpy.roll(sorted_freq, 1) != sorted_freq)
        selected = related_docs_indices[:indeces[0][indeces[0] >= k][0]]

        return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video']
