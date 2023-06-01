defmodule ToiaWeb.AuthController do
  use ToiaWeb, :controller

  action_fallback ToiaWeb.FallbackController

  def login(conn, %{"email" => email, "password" => password}) do
    case Toia.Guardian.authenticate(email, password) do
      {:ok, token, _claims} ->
        conn
        |> put_status(:ok)
        |> json(%{token: token})
      {:error, :invalid_credentials} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})
    end
  end

  def login(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "No email or password provided"})
  end
end
