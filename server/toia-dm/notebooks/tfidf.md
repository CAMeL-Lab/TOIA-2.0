```python
# !pip install sqlalchemy
```


```python
import sqlalchemy as db
import pandas as pd
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
NLP = spacy.load("en_core_web_sm")
```


```python
avatar_id = '1'
```


```python
sql_url = "mysql://root@localhost/toia"


engine = db.create_engine(sql_url)
connection = engine.connect()
metadata = db.MetaData()
videos = db.Table('video', metadata, autoload=True, autoload_with=engine)

avatar_kb = db.select([videos]).where(
    videos.columns.toia_id == avatar_id,
    videos.columns.private == 0,
    videos.columns.type.notin_(["filler", "exit"])
)

ResultProxy = connection.execute(avatar_kb)
ResultSet = ResultProxy.fetchall()

```


```python
df_avatar = pd.DataFrame(ResultSet, 
             columns=[
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
      <td>0b2</td>
      <td>answer</td>
      <td>1</td>
      <td>2</td>
      <td>0</td>
      <td>What is your favorite sport?</td>
      <td>I love soccer!</td>
      <td>en-US</td>
      <td>2</td>
      <td>5</td>
    </tr>
    <tr>
      <th>1</th>
      <td>a7c</td>
      <td>answer</td>
      <td>1</td>
      <td>3</td>
      <td>0</td>
      <td>What do you study?</td>
      <td>I study Computer Science.</td>
      <td>en-US</td>
      <td>10</td>
      <td>34</td>
    </tr>
    <tr>
      <th>2</th>
      <td>ef1</td>
      <td>answer</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>How are you?</td>
      <td>I am fine thanks!</td>
      <td>en-US</td>
      <td>5</td>
      <td>14</td>
    </tr>
    <tr>
      <th>3</th>
      <td>r21</td>
      <td>answer</td>
      <td>1</td>
      <td>6</td>
      <td>0</td>
      <td>When is your birthday?</td>
      <td>My birthday is in September.</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>4</th>
      <td>r2a</td>
      <td>answer</td>
      <td>1</td>
      <td>7</td>
      <td>0</td>
      <td>What do you do?</td>
      <td>I am doing a Ph.D.</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>5</th>
      <td>r2b</td>
      <td>answer</td>
      <td>1</td>
      <td>8</td>
      <td>0</td>
      <td>How old are you?</td>
      <td>I'm 35. Age last birthday</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>6</th>
      <td>r2c</td>
      <td>answer</td>
      <td>1</td>
      <td>9</td>
      <td>0</td>
      <td>Tell me something interesting?</td>
      <td>I wrote a book about the ethics of artificial ...</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>7</th>
      <td>r2e</td>
      <td>greeting</td>
      <td>1</td>
      <td>18</td>
      <td>0</td>
      <td>hey</td>
      <td>how's it going?</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>8</th>
      <td>r2f</td>
      <td>greeting</td>
      <td>1</td>
      <td>11</td>
      <td>0</td>
      <td>Hello</td>
      <td>Hi!</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>9</th>
      <td>r2h</td>
      <td>no-answer</td>
      <td>1</td>
      <td>13</td>
      <td>0</td>
      <td></td>
      <td>Sorry, I didn't get that</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>10</th>
      <td>r2m</td>
      <td>greeting</td>
      <td>1</td>
      <td>19</td>
      <td>0</td>
      <td>Howdy</td>
      <td>hey, I'm all right</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>11</th>
      <td>r2t</td>
      <td>y/n-answer</td>
      <td>1</td>
      <td>14</td>
      <td>0</td>
      <td>Do you like sushi?</td>
      <td>Yes</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>12</th>
      <td>r2y</td>
      <td>no-answer</td>
      <td>1</td>
      <td>16</td>
      <td>0</td>
      <td></td>
      <td>I don't have an answer for that</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>13</th>
      <td>r3y</td>
      <td>no-answer</td>
      <td>1</td>
      <td>17</td>
      <td>0</td>
      <td></td>
      <td>I can't answer this, sorryyyyy</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
    <tr>
      <th>14</th>
      <td>r4t</td>
      <td>y/n-answer</td>
      <td>1</td>
      <td>15</td>
      <td>0</td>
      <td>Do you like swimming?</td>
      <td>No</td>
      <td>en-US</td>
      <td>4</td>
      <td>20</td>
    </tr>
  </tbody>
</table>
</div>




```python
import spacy

nlp = spacy.load("en_core_web_sm")
docs = nlp.pipe(df_avatar['question'].values)
for doc in docs:
    print("--- next doc ---")
    print(doc)
    for token in doc:
        print(token.text, token.pos_, token.tag_)
    for ent in doc.ents:
        print(ent.text, ent.start_char, ent.end_char, ent.label_)
```

    --- next doc ---
    What is your favorite sport?
    What PRON WP
    is AUX VBZ
    your PRON PRP$
    favorite ADJ JJ
    sport NOUN NN
    ? PUNCT .
    --- next doc ---
    What do you study?
    What PRON WP
    do AUX VBP
    you PRON PRP
    study VERB VB
    ? PUNCT .
    --- next doc ---
    How are you?
    How ADV WRB
    are AUX VBP
    you PRON PRP
    ? PUNCT .
    --- next doc ---
    When is your birthday?
    When ADV WRB
    is AUX VBZ
    your PRON PRP$
    birthday NOUN NN
    ? PUNCT .
    --- next doc ---
    What do you do?
    What PRON WP
    do AUX VBP
    you PRON PRP
    do VERB VB
    ? PUNCT .
    --- next doc ---
    How old are you?
    How ADV WRB
    old ADJ JJ
    are AUX VBP
    you PRON PRP
    ? PUNCT .
    --- next doc ---
    Tell me something interesting?
    Tell VERB VB
    me PRON PRP
    something PRON NN
    interesting ADJ JJ
    ? PUNCT .
    --- next doc ---
    hey
    hey INTJ UH
    --- next doc ---
    Hello
    Hello INTJ UH
    --- next doc ---
    
    --- next doc ---
    Howdy
    Howdy INTJ UH
    Howdy 0 5 PERSON
    --- next doc ---
    Do you like sushi?
    Do AUX VBP
    you PRON PRP
    like VERB VB
    sushi NOUN NN
    ? PUNCT .
    --- next doc ---
    
    --- next doc ---
    
    --- next doc ---
    Do you like swimming?
    Do AUX VBP
    you PRON PRP
    like VERB VB
    swimming VERB VBG
    ? PUNCT .



```python
doc = nlp("hey, hi!")
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
df_avatar[df_avatar['type'] == "greeting"].sample(n=1)['answer'].values[0]
```




    "hey, I'm all right"




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
        answers = dataset[dataset['type'] == "greeting"].sample(n=1)
        return answers['answer'].values[0], answers['id_video'].values[0]
        
    querycorpus = []
    for i in range(0, len(df_avatar)):
        userquestion = preprocess(df_avatar['question'][i])
        querycorpus.append(userquestion)      

    # Creating the Bag of Words model with TFIDF and calc cosine_similarity
    vectorizer = CountVectorizer(decode_error="replace")
    vec_train = vectorizer.fit_transform(querycorpus) #this is needed to get the attribute vocabulary_
    training_vocabulary = vectorizer.vocabulary_
    transformer = TfidfTransformer()
    trainingvoc_vectorizer = CountVectorizer(decode_error="replace", vocabulary=training_vocabulary)
    tfidf_querycorpus = TfidfVectorizer().fit_transform(querycorpus)
    
    tfidf_userquestion = transformer.fit_transform(
        trainingvoc_vectorizer.fit_transform(
            numpy.array([
                preprocess(query)
            ]))) 
    cosine_similarities = cosine_similarity(tfidf_userquestion, tfidf_querycorpus)
    related_docs_indices = (-cosine_similarities[0]).argsort()
    sorted_freq = cosine_similarities[0][related_docs_indices]
    
    #note for this distance the problem we had befor with inf, we have now with 0. Again we decide
    #to make the prediction a bit random. This could be adjusted to remove any 0 distance and
    #pick the only ones left if any, and if none predict 1.
    
    if sum(sorted_freq)==0:
        answers = dataset[dataset['type'] == "no-answer"].sample(n=1)
        return answers['answer'].values[0], answers['id_video'].values[0]
    
    elif sorted_freq[k-1]!=sorted_freq[k] or sorted_freq[k-1]==sorted_freq[k]==0:
        selected = related_docs_indices[:k]
       
        return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video']
    else:
        indeces = numpy.where(numpy.roll(sorted_freq,1)!=sorted_freq)
        selected = related_docs_indices[:indeces[0][indeces[0]>=k][0]]
    
        return dataset.iloc[selected[0]]['answer'], dataset.iloc[selected[0]]['id_video']
```


```python
toia_answer("hola cachina", df_avatar)
```




    ("I can't answer this, sorryyyyy", 'r3y')




```python

```


```python

```


```python

```
