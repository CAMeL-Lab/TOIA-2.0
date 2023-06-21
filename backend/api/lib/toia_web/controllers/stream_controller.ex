defmodule ToiaWeb.StreamController do
  use ToiaWeb, :controller

  alias Toia.Streams
  alias Toia.Streams.Stream
  alias ToiaWeb.ToiaUserController

  action_fallback(ToiaWeb.FallbackController)

  def index(%{assigns: %{current_user: user}} = conn, _params) do
    stream = Streams.list_accessible_stream(user.id)
    render(conn, :index, stream: stream)
  end

  def create(
        %{assigns: %{current_user: user}} = conn,
        %{"stream_pic" => %Plug.Upload{path: filePath}} = stream_params
      ) do
    stream_params = Map.put(stream_params, "toia_id", user.id)

    with {:ok, %Stream{} = _stream} <- Streams.create_stream(stream_params, user, filePath) do
      streams = ToiaUserController.list_stream(user.id)

      conn
      |> put_status(:created)
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

  def show(%{assigns: %{current_user: user}} = conn, %{"id" => id}) do
    stream = Streams.get_stream!(id)
    stream = Map.put(stream, :pic, Streams.get_stream_pic(stream))

    if stream.toia_id == user.id do
      stream = Map.put(stream, :videos_count, Streams.get_videos_count(stream.id_stream))
      render(conn, :show, stream: stream)
    else
      if stream.private do
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
      else
        stream = Map.put(stream, :videos_count, Streams.get_videos_count(stream.id_stream, true))
        render(conn, :show, stream: stream)
      end
    end
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

  def filler(%{assigns: %{current_user: user}} = conn, %{"id" => stream_id} = _params) do
    {filler_video} = Streams.get_random_filler_video(user.id, stream_id)
    IO.inspect(filler_video)

    conn
    |> put_status(:ok)
    |> put_resp_header("content-type", "text/plain")
    |> text("/#{user.first_name}_#{user.id}/Videos/#{filler_video}")
  end

  def next(
        %{assigns: %{current_user: user}} = conn,
        %{"id" => stream_id, "question" => question} = _params
      ) do
    case Streams.get_next_video(user, stream_id, question) do
      %{id_video: _, answer: _, duration_seconds: _, url: _} = x ->
        conn
        |> put_status(:ok)
        |> json(x)

      {:error, error} ->
        IO.warn(error)

        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "error"})
    end
  end

  def smart_questions(
        %{assigns: %{current_user: user}} = conn,
        %{
          "id" => stream_id,
          "latest_question" => latest_question,
          "latest_answer" => latest_answer
        } = _params
      ) do
    stream = Streams.get_stream!(stream_id)
    data = Streams.get_smart_questions(user.id, stream.id_stream, latest_question, latest_answer)

    case data do
      nil ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "error"})

      x ->
        conn
        |> put_status(:ok)
        |> json(x)
    end
  end

  def smart_questions(conn, %{"id" => stream_id}) do
    stream = Streams.get_stream!(stream_id)
    avatar_id = stream.toia_id

    conn
    |> put_status(:ok)
    |> json(Streams.get_smart_questions(avatar_id, stream_id))
  end
end
