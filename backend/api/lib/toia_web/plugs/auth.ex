defmodule ToiaWeb.Plugs.Auth do
  alias Toia.ToiaUsers

  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    case Plug.Conn.get_req_header(conn, "authorization") do
      [token] -> ensureLogin(conn, token)
      _ -> conn
    end
  end

  def ensureLogin(conn, token) do
    token = String.replace(token, "Bearer ", "")

    with {:ok, claims} <- Toia.Guardian.decode_and_verify(token) do
      case Toia.Guardian.resource_from_claims(claims) do
        {:ok, user} ->
          user = Map.delete(user, :password)

          case ensureVerified(user) do
            {:ok, user} ->
              conn
              |> Plug.Conn.assign(:current_user, user)

            {:error, _reason} ->
              conn
          end

        {:error, _reason} ->
          conn
      end
    else
      {:error, _reason} -> conn
    end
  end

  def ensureVerified(user) do
    user = ToiaUsers.get_toia_user_by_email!(user.email)

    if user.verified do
      {:ok, user}
    else
      {:error, "Email not verified"}
    end
  end
end
