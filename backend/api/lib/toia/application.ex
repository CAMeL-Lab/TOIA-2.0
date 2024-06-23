defmodule Toia.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false
  require HTTPoison
  alias Jason, as: JSON

  use Application
  alias EmailHandlers

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
      # Goth for OAuth with Google
      {Goth, name: Toia.Goth},
      # Start the Endpoint (http/https)
      ToiaWeb.Endpoint
      # Start a worker by calling: Toia.Worker.start_link(arg)
      # {Toia.Worker, arg}
    ]

    :telemetry.attach_many("email-handlers", [
      [:swoosh, :deliver, :stop],
      [:swoosh, :deliver, :exception],
      [:swoosh, :deliver_many, :stop],
      [:swoosh, :deliver_many, :exception],
    ], &EmailHandlers.handle_event/4, nil)

    set_gcloud_cors_on_startup()
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

  def set_gcloud_cors_config(bucket_name) do
    # Define your CORS configuration directly in code
    cors_config = %{
      cors: [
        %{
          origin: [System.get_env("API_URL")],
          method: ["GET"],
          responseHeader: ["Content-Type"],
          maxAgeSeconds: 3600
        }
      ]
    }

    # Encode the configuration to a JSON string
    body = JSON.encode!(cors_config)

    # Construct the URL
    url = "https://storage.googleapis.com/storage/v1/b/#{bucket_name}?fields=cors"

    # Get the access token using Goth
    {:ok, token} = Goth.Token.for_scope("https://www.googleapis.com/auth/devstorage.full_control")

    # Set headers
    headers = [
      {"Authorization", "Bearer #{token.token}"},
      {"Content-Type", "application/json"}
    ]

    # Make the PATCH request
    HTTPoison.patch(url, body, headers)
  end
  
  defp set_gcloud_cors_on_startup do
    bucket_name = "toia-phoenix"

    case set_gcloud_cors_config(bucket_name) do
      {:ok, response} ->
        IO.puts("CORS configuration set successfully: #{inspect(response)}")
      {:error, reason} ->
        IO.puts("Failed to set CORS configuration: #{inspect(reason)}")
    end
  end
end
