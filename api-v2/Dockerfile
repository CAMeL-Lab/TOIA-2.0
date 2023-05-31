FROM elixir:1.14-otp-25-slim

RUN DEBIAN_FRONTEND='noninteractive' apt update && apt install -y inotify-tools

RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install hex phx_new --force

WORKDIR /toia

ENV MIX_ENV="dev"

COPY toia/mix.exs toia/mix.lock ./
RUN mix deps.get
COPY toia/ ./

COPY phoenix-start.sh ./
RUN chmod +x phoenix-start.sh

EXPOSE 4000

CMD ["./phoenix-start.sh"]