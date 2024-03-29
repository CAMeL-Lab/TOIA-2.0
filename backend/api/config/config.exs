# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :toia,
  ecto_repos: [Toia.Repo]

# Configures the endpoint
config :toia, ToiaWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: ToiaWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Toia.PubSub,
  live_view: [signing_salt: "+EaElx9f"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :toia, Toia.Mailer,
  adapter: Swoosh.Adapters.SMTP,
  relay: "smtp.gmail.com",
  port: 465,
  username: System.get_env("GMAIL_SMTP_EMAIL"),
  password: System.get_env("GMAIL_SMTP_APP_PASSWORD"),
  ssl: true,
  tls: :always,
  retries: 1,
  no_mx_lookups: false,
  auth: :always

config :amqp,
  connections: [
    translationConn: [url: "amqp://#{System.get_env("RMQ_USERNAME")}:#{System.get_env("RMQ_PASSWORD")}@#{System.get_env("RMQ_HOST")}:5672"],
  ],
  channels: [
    translationChannel: [connection: :translationConn]
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :bcrypt_elixir, :log_rounds, 12

config :toia, Toia.Guardian,
  issuer: "toia",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
