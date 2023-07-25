#!/bin/bash

MIX_ENV=prod mix ecto.setup
PORT=4000 MIX_ENV=prod mix phx.server