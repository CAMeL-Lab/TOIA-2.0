# TOIA-2.0

This is a repository for the TOIA 2.0 System.


# Notes

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
    
    GC_BUCKET=toia_store
    GOOGLE_SPEECH_API_CREDENTIALS_FILE=/speech_to_text/toia-capstone-2021-b944d1cc65aa.json
    GOOGLE_CLOUD_STORE_CREDENTIALS_FILE=/toia-capstone-2021-a17d9d7dd482.json
    
    OPENAI_API_KEY=

1. Set the password
2. Place the gcloud credential files to their respective directory (see above).
3. Set the value for `OPENAI_API_KEY `

### `.env` in interface

    SKIP_PREFLIGHT_CHECK=true

### `.env` in server is empty. Feel free to add any variable specific to server

## Running the app

#### Development mode

    docker-compose -f docker-compose-dev.yml up

Making Changes Under Development Mode

- The docker-compose file is setup such that react and nodejs changes are reflected as soon as you change the files in `/interface` or `/server`
- If you change anything inside `/server/q_api` or `/server/toia-dm`, you have to restart that particular container. 
- By default, the files and database are persistent under development mode (Check volume mounts in `docker-compose-dev.yml`). If you wish to start a fresh environment, run `docker-compose down -v` to make sure all the volumes are purged when shutting down the containers. Then start the containers using the command above.

#### Production mode

- Change the ENVIRONMENT variable in .env file to production


    docker-compose up