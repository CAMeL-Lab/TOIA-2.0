### Setup Instructions

#### Directory Overview
`/api`: Contains the phoenix api code

`/nginx`: Contains the nginx configuration

`/speech-to-text`: Contains the speech-to-text code for different modules (Currently, we only have gcloud)

`/q_api`: Contains the code for question suggestion api

`/toia-dm`: Contains the code for dialogue manager

#### Running the backend services
1. Copy the `.env` file to `TOIA-2.0/backend/`
2. Copy the `gcloud-credentials.json` file to `TOIA-2.0/backend/secrets/`. (If you don't find this folder, create it)
3. CD into the `backend` directory
4. Run `docker-compose up` to start the backend services


#### Running with nginx 

(Coming soon)

#### Loading video files
If you have a copy of video files in gcloud, you can copy them to the `TOIA-2.0/backend/api/Accounts` folder. The videos will be loaded automatically when the backend services are started.

## Frontend
1. CD into the `interface` directory
2. Run `npm install --force` to install the dependencies (The react app contains conflicting dependencies so a force install is required)
3. Run `npm start` to start the frontend server.