defmodule ToiaWeb.StreamViewPermissionController do
  use ToiaWeb, :controller

  alias Toia.Accounts
  alias Toia.Accounts.StreamViewPermission

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    stream_view_permission = Accounts.list_stream_view_permission()
    render(conn, :index, stream_view_permission: stream_view_permission)
  end

  def create(conn, %{"stream_view_permission" => stream_view_permission_params}) do
    with {:ok, %StreamViewPermission{} = stream_view_permission} <- Accounts.create_stream_view_permission(stream_view_permission_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/stream_view_permission/#{stream_view_permission}")
      |> render(:show, stream_view_permission: stream_view_permission)
    end
  end

  def show(conn, %{"id" => id}) do
    stream_view_permission = Accounts.get_stream_view_permission!(id)
    render(conn, :show, stream_view_permission: stream_view_permission)
  end

  def update(conn, %{"id" => id, "stream_view_permission" => stream_view_permission_params}) do
    stream_view_permission = Accounts.get_stream_view_permission!(id)

    with {:ok, %StreamViewPermission{} = stream_view_permission} <- Accounts.update_stream_view_permission(stream_view_permission, stream_view_permission_params) do
      render(conn, :show, stream_view_permission: stream_view_permission)
    end
  end

  def delete(conn, %{"id" => id}) do
    stream_view_permission = Accounts.get_stream_view_permission!(id)

    with {:ok, %StreamViewPermission{}} <- Accounts.delete_stream_view_permission(stream_view_permission) do
      send_resp(conn, :no_content, "")
    end
  end
end
