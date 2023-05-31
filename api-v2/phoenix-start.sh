#!/bin/bash

export MIX_ENV="dev"
mix ecto.create
mix ecto.migrate
mix phx.server