FROM node:14-alpine AS REACT_BUILD

WORKDIR /app
COPY interface/package.json .
RUN npm install
COPY interface/ .

RUN npm run-script build

RUN node css-fix.js

FROM elixir:1.14-otp-25-slim AS Release

RUN DEBIAN_FRONTEND='noninteractive' apt update && apt install -y inotify-tools && apt-get update && apt-get install make && apt install build-essential -y

RUN apt install curl -y

RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install hex phx_new --force

WORKDIR /app

COPY backend/api/mix.exs .
COPY backend/api/mix.lock .
RUN mix deps.get --only prod
RUN MIX_ENV=prod mix compile
COPY backend/api/ .

RUN chmod +x run_prod.sh

COPY --from=REACT_BUILD /app/build priv/static
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.3/install.sh | bash
RUN . ~/.nvm/nvm.sh && nvm install 14.18.1
RUN . ~/.nvm/nvm.sh && nvm use 14.18.1
RUN . ~/.nvm/nvm.sh && nvm alias default 14.18.1
RUN . ~/.nvm/nvm.sh && nvm use default
RUN . ~/.nvm/nvm.sh && npm install -g n
RUN . ~/.nvm/nvm.sh && n 14.18.1
RUN cd lib/toia_web/services && npm install && cd ../../../

EXPOSE 4000

CMD ["./run_prod.sh"]