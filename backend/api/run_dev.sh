#!/bin/bash

sed -E 's|(.+)|export \1|g' .env > tmp_env
source tmp_env
rm tmp_env
mix deps.get
mix ecto.setup
mix phx.server