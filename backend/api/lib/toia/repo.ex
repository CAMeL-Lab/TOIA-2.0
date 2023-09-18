defmodule Toia.Repo do
  use Ecto.Repo,
    otp_app: :toia,
    adapter: Ecto.Adapters.MyXQL
end
