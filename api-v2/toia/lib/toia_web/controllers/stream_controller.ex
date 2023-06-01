defmodule ToiaWeb.StreamController do
  use ToiaWeb, :controller

  alias Toia.Streams
  alias Toia.Streams.Stream

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    stream = Streams.list_public_stream()
    render(conn, :index, stream: stream)
  end

  def create(conn, stream_params) do
    with {:ok, %Stream{} = stream} <- Streams.create_stream(stream_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/stream/#{stream}")
      |> render(:show, stream: stream)
    end
  end

  def show(conn, %{"id" => id}) do
    stream = Streams.get_stream!(id)
    render(conn, :show, stream: stream)
  end

  def update(conn, %{"id" => id, "stream" => stream_params}) do
    stream = Streams.get_stream!(id)

    with {:ok, %Stream{} = stream} <- Streams.update_stream(stream, stream_params) do
      render(conn, :show, stream: stream)
    end
  end

  def delete(conn, %{"id" => id}) do
    stream = Streams.get_stream!(id)

    with {:ok, %Stream{}} <- Streams.delete_stream(stream) do
      send_resp(conn, :no_content, "")
    end
  end
end
