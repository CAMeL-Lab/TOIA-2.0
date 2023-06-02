# TOIA-2.0

This is a repository for TOIA 2.0 System with Soojin's Capstone Project "Elephant in the Room". You can watch a short demo
[here](https://www.youtube.com/watch?v=4EK19DnM4_c) and read the full documentation [here](https://meadow-oboe-807.notion.site/Elephant-in-the-Room-060a99def2bb4b8192e351aac2db52f1)


# Developer Setup

## Environment Variables

There are three `.env` files. One in the root directory, one in the `/interface` and the other one in `/server`

### `.env` in root:

    EXPRESS_PORT=3001
    DM_PORT=5001
    
    ENVIRONMENT=development
    
    EXPRESS_HOST=http://localhost
    DM_ROUTE=http://toia-dm:5001/dialogue_manager
    Q_API_ROUTE=http://q_api:5000/generateNextQ
    
    DB_CONNECTION=mysql
    DB_DATABASE=toia
    
    DB_HOST=mysql
    DB_USERNAME=root
    DB_PASSWORD=
    
    GC_BUCKET=
    GOOGLE_SPEECH_API_CREDENTIALS_FILE=/speech_to_text/toia-capstone-2021-b944d1cc65aa.json
    GOOGLE_CLOUD_STORE_CREDENTIALS_FILE=/toia-capstone-2021-a17d9d7dd482.json
    
    OPENAI_API_KEY=

1. Set the `DB_PASSWORD`
2. Set the `GC_BUCKET` to the bucket-name
3. Place the gcloud credential files to their respective directories:
   1. place `toia-capstone-2021-b944d1cc65aa.json` to `TOIA-2.0/server/speech_to_text/`
   2. place `toia-capstone-2021-a17d9d7dd482.json` to `TOIA-2.0/server/`
   3. Do not change the locations defined in the `.env` file above as those are relative to `server/`
4. Set the value for `OPENAI_API_KEY `

### `.env` in toia-dm:

Use same file as root

### `.env` in interface

    SKIP_PREFLIGHT_CHECK=true

### `.env` in server is empty. Feel free to add any variable specific to server

Note: It's probably a good idea to place Google cloud related environment variables to `.env` in `server/` but it would require some changes to the code. I'll update the ReadMe file when I make this change.

## Database Migration

1. Create a folder called `Accounts` in the server folder, if it does not exist. 
2. Copy the video folders to the `Accounts` folder provided by admin.
3. Navigate to [localhost:8080](localhost:8080) with the username and password provided in `.env` in the root folder.
4. Drop all the tables in toia (if needed backup the current toia db using export).
5. Import the database sql file into the toia table. 

## Running the app

Make sure you have installed docker and the docker daemon is running.

#### Development mode

    docker-compose -f docker-compose-dev.yml up

Making Changes Under Development Mode

- The docker-compose file is setup such that react and nodejs changes are reflected as soon as you change the files in `/interface` or `/server`
- If you change anything inside `/server/q_api` or `/server/toia-dm`, you have to restart that particular container. 
- By default, the files and database are persistent under development mode (Check volume mounts in `docker-compose-dev.yml`). If you wish to start a fresh environment, run `docker-compose down -v` to make sure all the volumes are purged when shutting down the containers. Then start the containers using the command above.
- If the dialogue manager (toia-dm) shuts down when running in docker, change docker settings to allow more RAM (check [this](https://stackoverflow.com/questions/44533319/how-to-assign-more-memory-to-docker-container)). 

#### Production mode

- Change the `ENVIRONMENT` variable in .env file to production and run `docker-compose up`
