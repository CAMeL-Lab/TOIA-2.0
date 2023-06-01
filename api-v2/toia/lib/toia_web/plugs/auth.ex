
defmodule ToiaWeb.Plugs.Auth do
  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    case Plug.Conn.get_req_header(conn, "authorization") do
      [token] -> ensureLogin(conn, token)
      _ -> unauthorized(conn)
    end
  end

  def ensureLogin(conn, token) do
    with {:ok, claims} <- Toia.Guardian.decode_and_verify(token) do
      case Toia.Guardian.resource_from_claims(claims) do
        {:ok, user} ->
          user = Map.delete(user, :password)
          conn
          |> Plug.Conn.assign(:current_user, user)
        {:error, _reason} -> unauthorized(conn)
      end
    else
      {:error, _reason} -> unauthorized(conn)
    end
  end

  def unauthorized(conn) do
    conn
    |> Plug.Conn.send_resp(401, "Unauthorized")
    |> Plug.Conn.halt()
  end
end
