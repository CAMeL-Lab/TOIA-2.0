# TOIA-2.0

This is a repository for the TOIA 2.0 System.


# Notes

## Environment Variables

There are three .env files. One in the root directory, one in the /interface and the other one in /server

### .env in root:

    EXPRESS_PORT=3001
    DM_PORT=5001
    
    ENVIRONMENT=development
    
    EXPRESS_HOST=http://localhost
    DM_ROUTE=http://localhost:5001/dialogue_manager
    Q_API_ROUTE=http://localhost:5000/generateNextQ
    
    DB_CONNECTION=mysql
    DB_DATABASE=toia
    
    DB_HOST=localhost
    DB_USERNAME=root
    DB_PASSWORD=ReallyComplicatedPassword
    
    GC_BUCKET=toia_store
    GOOGLE_SPEECH_API_CREDENTIALS_FILE=/speech_to_text/toia-capstone-2021-b944d1cc65aa.json
    GOOGLE_CLOUD_STORE_CREDENTIALS_FILE=/toia-capstone-2021-a17d9d7dd482.json

### .env in interface

    SKIP_PREFLIGHT_CHECK=true

### .env in server is empty. Feel free to add any variable specific to server