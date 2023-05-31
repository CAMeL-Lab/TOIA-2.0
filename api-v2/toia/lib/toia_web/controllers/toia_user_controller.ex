defmodule ToiaWeb.ToiaUserController do
  use ToiaWeb, :controller

  alias Toia.ToiaUsers
  alias Toia.ToiaUsers.ToiaUser

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    toia_user = ToiaUsers.list_toia_user()
    render(conn, :index, toia_user: toia_user)
  end

  def create(conn, toia_user_params) do
    with {:ok, %ToiaUser{} = toia_user} <- ToiaUsers.create_toia_user(toia_user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/toia_user/#{toia_user}")
      |> render(:show, toia_user: toia_user)
    end
  end

  def show(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)
    render(conn, :show, toia_user: toia_user)
  end

  def update(conn, %{"id" => id, "toia_user" => toia_user_params}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{} = toia_user} <- ToiaUsers.update_toia_user(toia_user, toia_user_params) do
      render(conn, :show, toia_user: toia_user)
    end
  end

  def delete(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{}} <- ToiaUsers.delete_toia_user(toia_user) do
      send_resp(conn, :no_content, "")
    end
  end
end
