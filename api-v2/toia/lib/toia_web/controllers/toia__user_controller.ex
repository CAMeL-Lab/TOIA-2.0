defmodule ToiaWeb.Toia_UserController do
  use ToiaWeb, :controller

  alias Toia.Accounts
  alias Toia.Accounts.Toia_User

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    toia_users = Accounts.list_toia_users()
    render(conn, :index, toia_users: toia_users)
  end

  def create(conn, toia__user_params) do
    IO.inspect(toia__user_params)
    with {:ok, %Toia_User{} = toia__user} <- Accounts.create_toia__user(toia__user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/toia_users/#{toia__user}")
      |> render(:show, toia__user: toia__user)
    end
  end

  def show(conn, %{"id" => id}) do
    toia__user = Accounts.get_toia__user!(id)
    render(conn, :show, toia__user: toia__user)
  end

  def update(conn, %{"id" => id, "toia__user" => toia__user_params}) do
    toia__user = Accounts.get_toia__user!(id)

    with {:ok, %Toia_User{} = toia__user} <- Accounts.update_toia__user(toia__user, toia__user_params) do
      render(conn, :show, toia__user: toia__user)
    end
  end

  def delete(conn, %{"id" => id}) do
    toia__user = Accounts.get_toia__user!(id)

    with {:ok, %Toia_User{}} <- Accounts.delete_toia__user(toia__user) do
      send_resp(conn, :no_content, "")
    end
  end
end
