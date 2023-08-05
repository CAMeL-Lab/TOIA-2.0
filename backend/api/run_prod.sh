#!/bin/bash

cd "lib/toia_web/services"
npm install
cd "../../../"

mix ecto.setup
mix phx.server