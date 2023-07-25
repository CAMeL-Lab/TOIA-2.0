#!/bin/bash

cd ".."
sed -E 's|(.+)|export \1|g' .env > tmp_env
source tmp_env
rm tmp_env
cd "api"
# mix deps.get
# mix ecto.setup
# mix phx.server
PORT=4000 MIX_ENV=prod mix phx.server