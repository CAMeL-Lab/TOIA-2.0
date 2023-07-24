FROM elixir:1.14-otp-25-slim

RUN DEBIAN_FRONTEND='noninteractive' apt update && apt install -y inotify-tools && apt-get update && apt-get install make && apt install build-essential -y

RUN apt install curl -y

RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install hex phx_new --force

WORKDIR /app

COPY mix.exs mix.lock ./
RUN mix deps.get
RUN mix deps.compile
COPY . ./

COPY run_prod.sh ./
RUN chmod +x run_prod.sh

EXPOSE 4000

CMD ["./run_prod.sh"]