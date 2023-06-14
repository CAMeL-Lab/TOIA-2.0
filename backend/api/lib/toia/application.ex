defmodule Toia.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      ToiaWeb.Telemetry,
      # Start the Ecto repository
      Toia.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Toia.PubSub},
      # Start Finch
      {Finch, name: Toia.Finch},
      # Start the Endpoint (http/https)
      ToiaWeb.Endpoint
      # Start a worker by calling: Toia.Worker.start_link(arg)
      # {Toia.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Toia.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ToiaWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
