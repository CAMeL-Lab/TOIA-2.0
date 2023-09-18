# q_api
TOIA question  generator 

# How to? 
1. Create a virtual environment
2. Run `pip install -r requirements.txt` in terminal
3. Run `flask run` to start the q_api
4. Send a POST request to `http://127.0.0.1:5000/generateNextQ` with following parameters in JSON: 

`{
    "qa_pair":"Your question? Your answer"
}`
5. Example JSON request:

`{
    "qa_pair":"What's the best thing you've learned about doing and training as an American? I'm not an American, but I've learned I have the inner willpower to do what it takes to build a better version of myself."
}`