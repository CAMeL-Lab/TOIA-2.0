defmodule ToiaWeb.IndexController do
  use ToiaWeb, :controller

  action_fallback(ToiaWeb.FallbackController)

  def index(conn, _) do
    file = File.read!("priv/static/index.html")
    html(conn, file)
  end
end
