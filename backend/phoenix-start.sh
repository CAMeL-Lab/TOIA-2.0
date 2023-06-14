#!/bin/bash

export MIX_ENV="dev"
mix deps.get
mix ecto.create
mix ecto.migrate
mix phx.server