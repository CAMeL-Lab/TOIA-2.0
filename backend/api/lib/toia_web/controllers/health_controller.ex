defmodule ToiaWeb.HealthController do
    use ToiaWeb, :controller
  
    alias Toia.ToiaUsers
  
    action_fallback(ToiaWeb.FallbackController)
  
    def index(conn, _params) do
      conn
      |> put_status(:ok)
      |> json(%{message: "Toia API is up and running"})
    end
end
  