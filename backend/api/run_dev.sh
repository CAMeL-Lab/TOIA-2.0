#!/bin/bash

cd "../.."
sed -E 's|(.+)|export \1|g' .env > tmp_env
source tmp_env
rm tmp_env
cd "backend/api"

cd "lib/toia_web/services"
npm install
cd "../../../"

# mix deps.get
# mix deps.compile
mix ecto.setup
mix ecto.migrate

cd ..
ln -s "$(pwd)/translation/Transcripts" "$(pwd)/api/priv/static/static"
cd api

PORT=4000 MIX_ENV=dev mix phx.server