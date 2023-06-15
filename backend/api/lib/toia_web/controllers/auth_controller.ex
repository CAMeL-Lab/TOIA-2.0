defmodule ToiaWeb.AuthController do
  use ToiaWeb, :controller

  alias Toia.ToiaUsers

  action_fallback(ToiaWeb.FallbackController)

  def login(conn, %{"email" => email, "password" => password}) do
    case Toia.Guardian.authenticate(email, password) do
      {:ok, token, _claims} ->
        user = ToiaUsers.get_toia_user_by_email!(email)

        conn
        |> put_status(:ok)
        |> json(%{
          token: token,
          data: %{
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            language: user.language
          }
        })

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
