# toia-dm

Make sure to edit the code in the src folder to replace the real database in the global variable SQL_URL (or follow the instructions below to create a dummy db).

Go into this directory
```bash
cd toia-dm
```

Install Conda environment using
```bash
conda env create -f toia_dm.yml
conda activate ds_toia
```
And, for environment managers different than conda, use:
```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```
(P.S. to create requirements.txt, first create virtual environment with venv, then manually install dependancies needed with pip. Porting from conda doesn't work at all)

Install MySql. On Mac:
```bash
brew install mysql
```
Start MySql and launch mysql prompt. On Mac:
```bash
mysql.server start
mysql_secure_installation
```
(follow the steps, nice way to install sql the secure way and can decide if you want to use password or not for root)
```bash
mysql -u root -p
#omit p if didn't setup password
```
Source db schema file:
```bash
mysql -u root -p < data/toia_db.sql
```
You may need to run again
```bash
mysql -u root -p
```

Use toia db, and add some dummy data:
```bash
use toia
INSERT INTO toia_user(id,first_name,last_name,language,email,password) VALUES (1,"Jon","Doe","en-US","jon.doe@gmail.com","abc123");
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("ef1","answer",1,1,0,"How are you?","I am fine thanks!","en-US",5,14);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("0b2","answer",1,2,0,"What is your favorite sport?","I love soccer!","en-US",2,5);
```
... and so on. Some example are in data/populate_dummy_data.sql

And run Flask app:
```bash
python main.py
```

Test using GET request to /dialogue_manager route, send json with body like below:
```json
{
    "query" : "what do you do",
    "avatar_id" : "1"
} 
```

Can do in command line using curl, or using postman (screenshot below). Curl has a bug that I haven't figured out yet. It gives a 400 bad request error. Use Postman for now.
```bash
curl -X GET -d @test/request.json -H "Content-Type: application/json" http://127.0.0.1:5000/dialogue_manager
```

![alt text](https://github.com/AMChierici/toia-dm/blob/main/test/img/postman.png "Postman screenshot")

When you finish, remember to turn MySQL off:
```bash
mysql.server stop
```

# Testing

Go to `localhost:5001/docs` to test the dialogue manager