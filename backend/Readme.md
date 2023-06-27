Note: Currently, we need to start each services individually. We will update this section once we have a docker-compose file to spin all the services together.

### Setup Instructions

#### Directory Overview
`/api`: Contains the phoenix api code

`/nginx`: Contains the nginx configuration

`/speech-to-text`: Contains the speech-to-text code for different modules (Currently, we only have gcloud)

#### Running the database server

1. CD into the backend directory 
2. Run `docker-compose up phpMyAdmin mysql` to start the database server

#### Running the API server

Note: You need to have elixir and erlang installed on your system. You can follow the instructions [here](https://elixir-lang.org/install.html) to install elixir and erlang.

1. CD into the `backend/api` directory
2. Copy the `dev.env` file to current directory.
3. Run `source dev.env` to set the environment variables
4. Run `mix deps.get` to install the dependencies
5. Run `mix ecto.create` to create the database
6. Run `mix ecto.migrate` to run the migrations
7. Run `mix phx.server` to start the API server

#### Running the speech-to-text server

(Coming soon)
The plug and play module for speech to text is not ready yet. We will update this section once it is ready. For now, to use speech to text, you need to start the old nodejs based api server.

#### Running the nginx server

(Coming soon)

## Frontend
1. CD into the `interface` directory
2. Run `npm install --force` to install the dependencies (This project contains conflicting dependencies so we need to force install)
3. Run `npm start` to start the frontend server