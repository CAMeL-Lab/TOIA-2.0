```python
# !pip install sqlalchemy
```


```python
import sqlalchemy as db
from sqlalchemy.sql import text
import pandas as pd
import numpy as np
import numpy
import re
import nltk
# from nltk.corpus import stopwords
# nltk.download('stopwords')
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.snowball import SnowballStemmer
import spacy
NLP = spacy.load("en_core_web_lg")
```


```python
avatar_id = '1'
stream_id = '2'
```


```python
sql_url = "mysql+mysqlconnector://root@localhost/toia"

engine = db.create_engine(sql_url)
connection = engine.connect()
metadata = db.MetaData()
# videos = db.Table('video', metadata, autoload=True, autoload_with=engine)

# avatar_kb = db.select([videos]).where(
#     videos.columns.toia_id == avatar_id,
#     videos.columns.private == 0,
#     videos.columns.type.notin_(["filler", "exit"])
# )

statement = text(f"""SELECT stream_has_video.stream_id_stream, video.* 
    FROM video 
    INNER JOIN stream_has_video 
    ON video.id_video = stream_has_video.video_id_video 
    WHERE stream_id_stream = {stream_id}
    AND toia_id = {avatar_id}
    AND private = 0
    AND type NOT IN ('filler', 'exit');""")

# ResultProxy = connection.execute(avatar_kb)
ResultProxy = connection.execute(statement)
ResultSet = ResultProxy.fetchall()

```

SQL equivalent to:
SELECT stream_has_video.stream_id_stream, video.* 
    FROM video 
    INNER JOIN stream_has_video 
    ON video.id_video = stream_has_video.video_id_video 
    WHERE stream_id_stream = <stream_id>;

```python
df_avatar = pd.DataFrame(ResultSet, 
             columns=[
                 'stream_id_stream',
                 'id_video', 
                 'type', 
                 'toia_id', 
                 'idx', 
                 'private', 
                 'question', 
                 'answer', 
                 'language', 
                 'likes', 
                 'views',
             ])
```


```python
df_avatar
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>stream_id_stream</th>
      <th>id_video</th>
      <th>type</th>
      <th>toia_id</th>
      <th>idx</th>
      <th>private</th>
      <th>question</th>
      <th>answer</th>
      <th>language</th>
      <th>likes</th>
      <th>views</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2</td>
      <td>p7c</td>
      <td>answer</td>
      <td>1</td>
      <td>19</td>
      <td>0</td>
      <td>What is a TOIA?</td>
      <td>It is an applications that allow people to int...</td>
      <td>en-US</td>
      <td>10</td>
      <td>34</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2</td>
      <td>pb2</td>
      <td>answer</td>
      <td>1</td>
      <td>18</td>
      <td>0</td>
      <td>What is your dissertation about?</td>
      <td>My research is about building applications lik...</td>
      <td>en-US</td>
      <td>2</td>
      <td>5</td>
    </tr>
  </tbody>
</table>
</div>




```python
docs = NLP.pipe(df_avatar['question'].values)
for doc in docs:
    print("--- next doc ---")
    print(doc)
    for token in doc:
        print(token.text, token.pos_, token.tag_)
    for ent in doc.ents:
        print(ent.text, ent.start_char, ent.end_char, ent.label_)
```

    --- next doc ---
    What is a TOIA?
    What PRON WP
    is AUX VBZ
    a DET DT
    TOIA PROPN NNP
    ? PUNCT .
    --- next doc ---
    What is your dissertation about?
    What PRON WP
    is AUX VBZ
    your PRON PRP$
    dissertation NOUN NN
    about ADP IN
    ? PUNCT .



```python
doc = NLP("hey, hi!")
```


```python
['INTJ', 'UH'] in [[token.pos_, token.tag_] for token in doc]
```




    True




```python
set([token.tag_ for token in doc])
```




    {',', '.', 'UH'}




```python
df_greetings = df_avatar[df_avatar['type'] == "greeting"]
if df_greetings.shape[0] > 0:
    df_greetings.sample(n=1)['answer'].values[0]
else:
    print("204 No Content: you haven't recorded greetings")
        
```

    204 No Content: you haven't recorded greetings



```python
ps = SnowballStemmer('english')

def preprocess(text):
            # Stem and remove stopwords
            text = re.sub('[^a-zA-Z]', ' ', text)
            text = text.lower()
            text = text.split()
            text = [ps.stem(word) for word in text]  # if not word in set(stopwords.words('english'))]
            return ' '.join(text)


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
```


```python
toia_answer("hola cachina", df_avatar)
```




    ("You haven't recorded no-answers", '204', 'No Content')



***

## Experiment with spaCy


```python
def process_text(text):
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
```


```python
def calculate_similarity(text1, text2):
    base = NLP(process_text(text1))
    compare = NLP(process_text(text2))
    return base.similarity(compare)
```


```python
docs = NLP.pipe(df_avatar['question'].values)
similar_list = [calculate_similarity("Yo!", doc.text) for doc in docs]
similar_list
```

    <ipython-input-147-5b3d2fc83f3d>:4: UserWarning: [W008] Evaluating Doc.similarity based on empty vectors.
      return base.similarity(compare)





    [0.1960290722844779,
     0.07379277395621531,
     0.0,
     0.0,
     0.3354120586746895,
     0.29740283310352034,
     0.5982720020715394,
     0.4097530789445466,
     0.0,
     0.33224449180378135,
     0.3386126303165402,
     0.0,
     0.30997427744569134]




```python
[(df_avatar.loc[j, 'question'], i) for
 i, j in zip(
     np.sort(similar_list)[::-1], 
     np.argsort(similar_list)[::-1])]
```




    [('hey', 0.5982720020715394),
     ('Hello', 0.4097530789445466),
     ('Do you like sushi?', 0.3386126303165402),
     ('How old are you?', 0.3354120586746895),
     ('Howdy', 0.33224449180378135),
     ('Do you like swimming?', 0.30997427744569134),
     ('Tell me something interesting?', 0.29740283310352034),
     ('What is your favorite sport?', 0.1960290722844779),
     ('What do you study?', 0.07379277395621531),
     ('', 0.0),
     ('', 0.0),
     ('What do you do?', 0.0),
     ('How are you?', 0.0)]



### Test new function


```python
dataset[dataset['type'] == "abal"].shape[0] == 0
```




    True




```python
# query = "what's your name"
# dataset = df_avatar.copy()
# k = 1

def toia_answer_new(query, dataset, k=1):
    doc = NLP(query)
    # if Greeting, greet
    if ['INTJ', 'UH'] in [[token.pos_, token.tag_] for token in doc]:
        if dataset[dataset['type'] == "greeting"].shape[0] > 0:
            answers = dataset[dataset['type'] == "greeting"].sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0]
        else:
            answers = dataset[dataset['type'] == "no-answer"].sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], "No greetings recorded"

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
        answers = dataset[dataset['type'] == "no-answer"].sample(n=1)
        return answers['answer'].values[0], answers['id_video'].values[0], "tfidf sim all 0"

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
            answers = dataset[dataset['type'] == "no-answer"].sample(n=1)
            return answers['answer'].values[0], answers['id_video'].values[0], f"spaCy sim: {max(cosine_similarities)}"

            
# For testing function, convert all 'return' to 'return_a ='
# return_a  
```


```python
def run_toia(dataset):
    print("TOIA starts")

    while True:
        query = input('> ')
        if query == "stop":
            break

        output = toia_answer_new(query, dataset)
        if output is None:
            break

        print(output)
```


```python
run_toia(df_avatar)
```

    TOIA starts


    >  what's your name


    <ipython-input-147-5b3d2fc83f3d>:4: UserWarning: [W008] Evaluating Doc.similarity based on empty vectors.
      return base.similarity(compare)


    ("I don't have an answer for that", 'r2y', 'spaCy sim: 1.0')


    >  how are you


    ('I am fine thanks!', 'ef1', 'tfidf sim: [0.98471278]')


    >  tell me something I don't know


    ('I wrote a book about the ethics of artificial intelligence', 'r2c', 'tfidf sim: [0.8660254]')


    >  wow congrats


    ("hey, I'm all right", 'r2m')


    >  what else can I ask you about


    ('I wrote a book about the ethics of artificial intelligence', 'r2c', 'spaCy sim: 0.7274114971012712')


    >  ok, got it something else?


    ("hey, I'm all right", 'r2m')


    >  what do you do


    ('I am doing a Ph.D.', 'r2a', 'tfidf sim: [0.9967007]')


    >  in what subject


    ("Sorry, I didn't get that", 'r2h', 'spaCy sim: 0.45464181077339555')


    >  never mind


    ("I don't have an answer for that", 'r2y', 'tfidf sim all 0')


    >  what is your favorite food


    ('I love soccer!', '0b2', 'tfidf sim: [0.87910785]')


    >  stop


***

## WIP: Can see if an ELIZA-like algorithm can help

https://github.com/wadetb/eliza


***
