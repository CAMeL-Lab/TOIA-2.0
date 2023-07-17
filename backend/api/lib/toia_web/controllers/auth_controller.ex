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

  def confirm_email(conn, %{"token" => token}) do
    case Toia.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        user = ToiaUsers.get_toia_user_by_email!(claims["email"])
        ToiaUsers.update_toia_user(user, %{verified: true})

        conn
        |> put_status(:ok)
        |> json(%{message: "Email confirmed successfully. Please return back to the app to login."})

      {:error, _reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid token"})
    end
  end
end
