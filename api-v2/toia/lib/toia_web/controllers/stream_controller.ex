defmodule ToiaWeb.StreamController do
  use ToiaWeb, :controller

  alias Toia.Streams
  alias Toia.Streams.Stream
  alias ToiaWeb.ToiaUserController

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    stream = Streams.list_public_stream()
    render(conn, :index, stream: stream)
  end

  def create(%{assigns: %{current_user: user}} = conn, %{"stream_pic" => %Plug.Upload{path: filePath}} = stream_params) do
    stream_params = Map.put(stream_params, "toia_id", user.id)
    with {:ok, %Stream{} = stream} <- Streams.create_stream(stream_params, user, filePath) do
      streams = ToiaUserController.list_stream(user.id)
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/stream/#{stream.id_stream}")
      |> render(:index, stream: streams)
    else
      {:error, reason} ->
        IO.warn("Photo couldn't be uploaded")
        IO.warn(reason)
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: reason})
      _ ->
        IO.inspect("Something went wrong")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Internal server error"})
    end
  end

  def create(conn, _) do
    conn
    |> json(%{error: "Please also attach a photo"})
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
