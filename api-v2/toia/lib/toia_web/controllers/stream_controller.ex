defmodule ToiaWeb.StreamController do
  use ToiaWeb, :controller

  alias Toia.Accounts
  alias Toia.Accounts.Stream

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    stream = Accounts.list_stream()
    render(conn, :index, stream: stream)
  end

  def create(conn, %{"stream" => stream_params}) do
    with {:ok, %Stream{} = stream} <- Accounts.create_stream(stream_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/stream/#{stream}")
      |> render(:show, stream: stream)
    end
  end

  def show(conn, %{"id" => id}) do
    stream = Accounts.get_stream!(id)
    render(conn, :show, stream: stream)
  end

  def update(conn, %{"id" => id, "stream" => stream_params}) do
    stream = Accounts.get_stream!(id)

    with {:ok, %Stream{} = stream} <- Accounts.update_stream(stream, stream_params) do
      render(conn, :show, stream: stream)
    end
  end

  def delete(conn, %{"id" => id}) do
    stream = Accounts.get_stream!(id)

    with {:ok, %Stream{}} <- Accounts.delete_stream(stream) do
      send_resp(conn, :no_content, "")
    end
  end
end
