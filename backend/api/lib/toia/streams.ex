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
  alias ServiceHandlers.DialogueManager
  alias ServiceHandlers.SmartSuggester

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
    Repo.all(from(s in Stream, where: s.private == false))
  end

  def list_stream(user_id) do
    query = from(s in Stream, where: s.toia_id == ^user_id)
    streams = Repo.all(query)
    # Add stream video count to each stream
    Enum.map(streams, fn stream ->
      stream = Map.put(stream, :videos_count, get_videos_count(stream.id_stream))
      stream = Map.put(stream, :pic, get_stream_pic(stream))
      stream
    end)
  end

  def list_public_stream(user_id) do
    query = from(s in Stream, where: s.toia_id == ^user_id and s.private == false)
    streams = Repo.all(query)
    # Add stream video count to each stream
    Enum.map(streams, fn stream ->
      stream = Map.put(stream, :videos_count, get_videos_count(stream.id_stream, true))
      stream = Map.put(stream, :pic, get_stream_pic(stream))
      stream
    end)
  end

  def list_accessible_stream(user_id) do
    query =
      from(s in Stream,
        where: s.private == false or s.toia_id == ^user_id
      )

    streams = Repo.all(query)

    streams =
      Enum.map(streams, fn stream ->
        Map.put(stream, :pic, get_stream_pic(stream))
      end)

    Enum.map(streams, fn stream ->
      Map.put(stream, :videos_count, get_videos_count(stream.id_stream))
    end)
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
    canAccessAll = (stream.toia_id == user_id)
  
    query =
      from(q in Question,
        inner_join: vqs in VideoQuestionStream,
        on: q.id == vqs.id_question,
        inner_join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id and vqs.type == :filler and (v.private == ^canAccessAll or ^canAccessAll == true)
      )
  
    query =
      from([_q, vqs, _v] in query,
        select: {vqs.id_video}
      )
  
    all_videos = Repo.all(query)
  
    if length(all_videos) == 0 do
      IO.warn("No filler video found for stream #{stream_id}")
      nil
    else
      videoID = all_videos |> Enum.random() |> elem(0)
      video = Videos.get_video!(videoID)
      user = ToiaUsers.get_toia_user!(video.toia_id)
      video = Map.put(video, :url, Videos.getPlaybackUrl(user.first_name, user.id, video.id_video))
      {:ok, video}
    end
  end
  
  @doc """
  Returns the exact match video of a question
  """
  def getExactMatch(stream_id, question) do
    query =
      from(q in Question,
        inner_join: vqs in VideoQuestionStream,
        on: q.id == vqs.id_question,
        inner_join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id and q.question == ^question
      )

    query =
      from([_q, vqs, v] in query,
        select: %{id_video: vqs.id_video, answer: v.answer, duration_seconds: v.duration_seconds}
      )

    all_videos = Repo.all(query)

    if length(all_videos) == 0 do
      {:no_match}
    else
      rand_video = all_videos |> Enum.random()
      {:ok, rand_video}
    end
  end

  def request_dm(query, stream_id) do
    body = %{"query" => query, "stream_id" => to_string(stream_id)}

    with {:ok, response} <- DialogueManager.post("", body) do
      {:ok, response.body}
    else
      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.puts(:stderr, "**** TOIA_DM ERROR ****")
        IO.puts(:stderr, reason)
        IO.puts(:stderr, "***********************")
        {:error, reason}

      x ->
        IO.puts(:stderr, "**** TOIA_DM ERROR ****")
        IO.inspect(x)
        {:error, "unknown error"}
    end
  end

  @doc """
  Retrieve next video to play based on the question
  """
  def get_next_video(user, stream_id, question) do
    with {:no_match} <- getExactMatch(stream_id, question),
         {:ok, response} <- request_dm(question, stream_id) do
      {:ok, Map.put(response, :url, Videos.getPlaybackUrl(user.first_name, user.id, response["id_video"]))}
    else
      {:error, reason} ->
        {:error, reason}

      # A match was found
      {:ok, x} ->
        {:ok, Map.put(x, :url, Videos.getPlaybackUrl(user.first_name, user.id, x.id_video))}
    end
  end

  @doc """
  Retrieve suggestion from q_api
  """
  def get_smart_questions(stream_id, "", _) do
    question_ids = [19, 20]

    query =
      from(q in Question,
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
      )
    data = Repo.all(query)

    {:ok, data}
  end

  def get_smart_questions(stream_id, latest_question, latest_answer) do
    body = %{
      "stream_id" => to_string(stream_id),
      "latest_question" => latest_question,
      "latest_answer" => latest_answer
    }

    with {:ok, response} <- SmartSuggester.post("", body) do
      {:ok, response.body}
    else
      {:error, reason} ->
        IO.puts(:stderr, "**** TOIA_SMART_SUGGESTER ERROR ****")
        IO.inspect(reason)
        {:error, reason}
    end
  end

  def get_videos_count(stream_id) do
    query =
      from(vqs in VideoQuestionStream,
        where: vqs.id_stream == ^stream_id,
        select: vqs.id_video
      )

    Repo.all(query) |> Enum.uniq() |> length()
  end

  def get_videos_count(stream_id, _public) do
    query =
      from(vqs in VideoQuestionStream,
        join: v in Video,
        on: v.id_video == vqs.id_video,
        where: vqs.id_stream == ^stream_id,
        where: v.private == false,
        select: vqs.id_video
      )

    Repo.all(query) |> Enum.uniq() |> length()
  end

  #  `/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`;
  def get_stream_pic(stream) do
    user_id = stream.toia_id
    user = ToiaUsers.get_toia_user!(user_id)

    "#{System.get_env("API_URL")}/media/#{user.first_name}_#{user.id}/StreamPic/#{stream.name}_#{stream.id_stream}.jpg"
  end
end
