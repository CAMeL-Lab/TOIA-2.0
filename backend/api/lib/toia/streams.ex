defmodule Toia.Streams do
  @moduledoc """
  The Streams context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Streams.Stream
  alias Toia.Questions.Question
  alias Toia.Videos.Video
  alias Toia.Videos
  alias Toia.VideosQuestionsStreams.VideoQuestionStream
  alias Toia.ToiaUsers

  @doc """
  Returns the list of stream.

  ## Examples

      iex> list_stream()
      [%Stream{}, ...]

  """
  def list_stream do
    Repo.all(Stream)
  end

  def list_public_stream do
    Repo.all(from s in Stream, where: s.private == false)
  end

  def list_accessible_stream(user_id) do
    query = from s in Stream,
      where: s.private == false or s.toia_id == ^user_id
    Repo.all(query)
  end

  @doc """
  Gets a single stream.

  Raises `Ecto.NoResultsError` if the Stream does not exist.

  ## Examples

      iex> get_stream!(123)
      %Stream{}

      iex> get_stream!(456)
      ** (Ecto.NoResultsError)

  """
  def get_stream!(id), do: Repo.get!(Stream, id)

  @doc """
  Creates a stream.

  ## Examples

      iex> create_stream(%{field: value})
      {:ok, %Stream{}}

      iex> create_stream(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_stream(attrs, user, filePath) do
    if attrs["name"] == "" or attrs["name"] == nil or attrs["name"] == "All" do
      {:error, "Stream name cannot be empty or All"}
    else
      {:ok, %Stream{} = stream} = %Stream{} |> Stream.changeset(attrs) |> Repo.insert()

      destDir = "Accounts/#{user.first_name}_#{user.id}/StreamPic/"
      destFilename = "#{attrs["name"]}_#{stream.id_stream}.jpg"

      case File.mkdir_p(destDir) do
        :ok ->
          case File.rename(filePath, destDir <> destFilename) do
            :ok -> {:ok, stream}
            {:error, reason} -> {:error, reason}
          end

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  def create_stream(attrs \\ %{}) do
    %Stream{}
    |> Stream.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a stream.

  ## Examples

      iex> update_stream(stream, %{field: new_value})
      {:ok, %Stream{}}

      iex> update_stream(stream, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_stream(%Stream{} = stream, attrs) do
    stream
    |> Stream.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a stream.

  ## Examples

      iex> delete_stream(stream)
      {:ok, %Stream{}}

      iex> delete_stream(stream)
      {:error, %Ecto.Changeset{}}

  """
  def delete_stream(%Stream{} = stream) do
    Repo.delete(stream)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking stream changes.

  ## Examples

      iex> change_stream(stream)
      %Ecto.Changeset{data: %Stream{}}

  """
  def change_stream(%Stream{} = stream, attrs \\ %{}) do
    Stream.changeset(stream, attrs)
  end

  @doc """
  Returns a filler video for the stream.
  """
  def get_random_filler_video(user_id, stream_id) do
    stream = get_stream!(stream_id)

    case stream.toia_id == user_id do
      true ->
        query =
          from q in Question,
            inner_join: vqs in VideoQuestionStream,
            on: q.id == vqs.id_question,
            inner_join: v in Video,
            on: v.id_video == vqs.id_video,
            where: vqs.id_stream == ^stream_id and vqs.type == :filler

        query =
          from [_q, vqs, _v] in query,
            select: {vqs.id_video}

        all_videos = Repo.all(query)

        if length(all_videos) == 0 do
          IO.warn("No filler video found for stream #{stream_id}")
          nil
        else
          all_videos |> Enum.random()
        end

      false ->
        query =
          from q in Question,
            inner_join: vqs in VideoQuestionStream,
            on: q.id == vqs.id_question,
            inner_join: v in Video,
            on: v.id_video == vqs.id_video,
            where: vqs.id_stream == ^stream_id and v.private == false and vqs.type == :filler

        query =
          from [_q, vqs, _v] in query,
            select: {vqs.id_video}

        all_videos = Repo.all(query)

        if length(all_videos) == 0 do
          IO.warn("No filler video found for stream #{stream_id}")
          nil
        else
          all_videos |> Enum.random()
        end
    end
  end

  @doc """
  Returns the exact match video of a question
  """
  def getExactMatch(stream_id, question) do
    query =
      from q in Question,
        inner_join: vqs in VideoQuestionStream,
        on: q.id == vqs.id_question,
        inner_join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id and q.question == ^question

    query =
      from [_q, vqs, v] in query,
        select: %{id_video: vqs.id_video, answer: v.answer, duration_seconds: v.duration_seconds}

    all_videos = Repo.all(query)

    if length(all_videos) == 0 do
      nil
    else
      all_videos |> Enum.random()
    end
  end

  @doc """
  Retrieve next video to play based on the question
  """
  def get_next_video(user, stream_id, question) do
    case getExactMatch(stream_id, question) do
      nil ->
        stream = get_stream!(stream_id)

        req_body =
          Poison.encode!(%{
            params: %{
              query: question,
              stream_id: to_string(stream_id),
              avatar_id: to_string(stream.toia_id)
            }
          })

        dm_response =
          HTTPoison.post!("http://localhost:5001/dialogue_manager", req_body, [
            {"Content-Type", "application/json"}
          ])

        if dm_response.status_code != 200 do
          IO.inspect(dm_response)
          {:error, "error"}
        else
          body = Poison.decode!(dm_response.body)

          id_video = body["id_video"]

          if id_video == "204" do
            {:error, "error"}
          else
            video = Videos.get_video!(id_video)

            %{
              id_video: video.id_video,
              answer: video.answer,
              duration_seconds: video.duration_seconds,
              url: Videos.getPlaybackUrl(user.first_name, user.id, video.id_video)
            }
          end
        end

      x ->
        Map.put(x, :url, Videos.getPlaybackUrl(user.first_name, user.id, x.id_video))
    end
  end

  @doc """
  Retrieve suggestion from q_api
  """
  def get_smart_questions(avatar_id, stream_id, latest_question, latest_answer) do
    # TODO: TEST this function
    post_req_data = %{
      new_q: latest_question,
      new_a: latest_answer,
      n_suggestions: 5,
      avatar_id: avatar_id,
      stream_id: stream_id
    }

    timeout = 20000
    method = :post
    url = System.get_env("SMARTQ_ROUTE")
    headers = [{"content-type", "application/json"}]
    body = Jason.encode!(post_req_data)

    request = HTTPoison.request(method, url, headers, body, timeout)

    case request do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
        |> Jason.decode!()
        |> Map.get("suggestions")

      {:ok, %HTTPoison.Response{status_code: 404}} ->
        IO.puts("404")
        nil

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.puts(reason)
        nil
    end
  end

  def get_smart_questions(_avatar_id, stream_id) do
    question_ids = [19, 20]

    query =
      from q in Question,
        join: vqs in VideoQuestionStream,
        on: vqs.id_question == q.id,
        join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id,
        where: q.suggested_type in [:answer, :"y/n-answer"],
        where: q.id not in ^question_ids,
        order_by: q.id,
        limit: 5,
        select: %{question: q.question}

    Repo.all(query)
  end

  def get_videos_count(stream_id) do
    query =
      from vqs in VideoQuestionStream,
        where: vqs.id_stream == ^stream_id,
        select: count(vqs.id_video)

    Repo.one(query)
  end

  def get_videos_count(stream_id, _private) do
    query =
      from vqs in VideoQuestionStream,
        join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id,
        where: v.private == false,
        select: count(vqs.id_video)

    Repo.one(query)
  end

  #  `/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`;
  def get_stream_pic(stream) do
    user_id = stream.toia_id
    user = ToiaUsers.get_toia_user!(user_id)
    "/#{user.first_name}_#{user.id}/StreamPic/#{stream.name}_#{stream.id_stream}.jpg"
  end
end
