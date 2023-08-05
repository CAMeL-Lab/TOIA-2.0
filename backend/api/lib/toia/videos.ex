defmodule Toia.Videos do
  @moduledoc """
  The Videos context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Videos.Video
  alias Toia.Streams.Stream
  alias Toia.VideosQuestionsStreams
  alias Toia.VideosQuestionsStreams.VideoQuestionStream
  alias Toia.Questions.Question
  alias Toia.Questions
  alias Toia.ToiaUsers

  alias ServiceHandlers.QuestionSuggester
  alias ServiceHandlers.GenerateEmbeddings

  @doc """
  Returns the list of video.

  ## Examples

      iex> list_video()
      [%Video{}, ...]

  """
  def list_video(user_id) do
    query =
      from(v in Video,
        where: v.toia_id == ^user_id,
        order_by: [desc: v.idx]
      )

    Repo.all(query)
  end

  def list_public_video(user_id) do
    query =
      from(v in Video,
        where: v.toia_id == ^user_id and v.private == false,
        order_by: [desc: v.idx]
      )

    Repo.all(query)
  end

  @doc """
  Gets a single video.

  Raises `Ecto.NoResultsError` if the Video does not exist.

  ## Examples

      iex> get_video!(123)
      %Video{}

      iex> get_video!(456)
      ** (Ecto.NoResultsError)

  """
  def get_video!(id), do: Repo.get!(Video, id)
  def get_video(id), do: Repo.get(Video, id)

  @doc """
  Creates a video.

  ## Examples

      iex> create_video(%{field: value})
      {:ok, %Video{}}

      iex> create_video(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_video(attrs \\ %{}) do
    %Video{}
    |> Video.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a video.

  ## Examples

      iex> update_video(video, %{field: new_value})
      {:ok, %Video{}}

      iex> update_video(video, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_video(%Video{} = video, attrs) do
    video
    |> Video.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a video.

  ## Examples

      iex> delete_video(video)
      {:ok, %Video{}}

      iex> delete_video(video)
      {:error, %Ecto.Changeset{}}

  """
  def delete_video(%Video{} = video) do
    Repo.delete(video)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking video changes.

  ## Examples

      iex> change_video(video)
      %Ecto.Changeset{data: %Video{}}

  """
  def change_video(%Video{} = video, attrs \\ %{}) do
    Video.changeset(video, attrs)
  end

  @doc """
  Returns true if the user is allowed to access this video
  """
  def canAccess(user, video) do
    user_id = user.id
    video.toia_id == user_id || video.private == false
  end

  @doc """
  Returns playback url for a video
  """
  def getPlaybackUrl(video_id) do
    video = get_video!(video_id)
    user = ToiaUsers.get_toia_user!(video.toia_id)
    getPlaybackUrl(user.first_name, user.id, video.id_video)
  end

  @doc """
  Returns the playback url. Legacy: `/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`
  """
  def getPlaybackUrl(first_name, toia_id, video_id) do
    "#{System.get_env("API_URL")}/media/#{first_name}_#{toia_id}/Videos/#{video_id}"
  end

  @doc """
  Returns list of all the streams this video is in
  """
  def getVideoStreams(video_id) do
    query =
      from(s in Stream,
        join: vqs in VideoQuestionStream,
        on: s.id_stream == vqs.id_stream,
        where: vqs.id_video == ^video_id,
        select: s,
        distinct: true
      )

    Repo.all(query)
  end

  @doc """
  Return list of public streams this video is in
  """
  def getVideoPublicStreams(video_id) do
    query =
      from(s in Stream,
        join: vqs in VideoQuestionStream,
        on: s.id_stream == vqs.id_stream,
        where: vqs.id_video == ^video_id and s.private == false,
        select: s,
        distinct: true
      )

    Repo.all(query)
  end

  @doc """
  Returns the list of all the questions this video is attached to
  """
  def getVideoQuestions(video_id) do
    query =
      from(vqs in VideoQuestionStream,
        join: q in Question,
        on: vqs.id_question == q.id,
        where: vqs.id_video == ^video_id,
        select: q,
        distinct: true
      )

    Repo.all(query)
  end

  @doc """
  Returns the list of all the questions this video is attached to, but the stream must be public
  """
  def getVideoPublicQuestions(video_id) do
    query =
      from(vqs in VideoQuestionStream,
        join: q in Question,
        on: vqs.id_question == q.id,
        join: s in Stream,
        on: vqs.id_stream == s.id_stream,
        where: vqs.id_video == ^video_id and s.private == false,
        select: q,
        distinct: true
      )

    Repo.all(query)
  end

  @doc """
  Returns next idx for a video
  """
  def getNextIdx do
    query =
      from(v in Video,
        select: max(v.idx)
      )

    max = Repo.one(query)

    if is_nil(max) do
      {:ok, 0}
    else
      {:ok, max + 1}
    end
  end

  @doc """
  Generates a random video id
  """
  def generateRandomVideoID(first_name, user_id, videoIDX) do
    raw = :crypto.strong_rand_bytes(32) |> Base.encode16() |> String.slice(0, 8)
    videoID = "#{first_name}_#{user_id}_#{videoIDX}_#{raw}.mp4"
    {:ok, videoID}
  end

  @doc """
  Returns the video path given a video id
  """
  def getVideoPath(first_name, user_id, id_video) do
    "Accounts/#{first_name}_#{user_id}/Videos/#{id_video}"
  end

  def getDestPath(first_name, user_id) do
    "Accounts/#{first_name}_#{user_id}/Videos/"
  end

  @doc """
  Copy and delete a file
  """
  def copyAndDelete(oldPath, destDir, destFilename) do
    case File.mkdir_p(destDir) do
      :ok ->
        case File.cp(oldPath, destDir <> destFilename) do
          :ok ->
            File.rm(oldPath)

          {:error, reason} ->
            IO.puts("Error copying file")
            {:error, reason}
        end

      {:error, reason} ->
        IO.puts("Error creating directory")
        {:error, reason}
    end
  end

  @doc """
  Save the video file
  """
  def saveVideoFile(first_name, user_id, id_video, upload_path) do
    copyAndDelete(upload_path, getDestPath(first_name, user_id), id_video)
  end

  @doc """
  Remove the video file
  """
  def removeVideoFile(first_name, user_id, id_video) do
    dest = getVideoPath(first_name, user_id, id_video)

    with :ok <- File.rm(dest) do
      {:ok, "File removed"}
    else
      {:error, :eacces} -> {:error, "Permission Denied"}
      {:error, :enoent} -> {:error, "No such file or directory"}
      {:error, :enospc} -> {:error, "No space left on device"}
      {:error, :enotdir} -> {:error, "Not a directory"}
      {:error, :eperm} -> {:error, "The file is a directory and user is not super-user"}
      {:error, :einval} -> {:error, "Invalid argument"}
    end
  end

  @doc """
  Link to the streams
  """
  def linkVideoQuestionsStreams(video_id, questions, streams, type) do
    {:ok,
     Enum.map(streams, fn stream_id ->
       linkVideoQuestionsStream(video_id, questions, stream_id, type)
     end)}
  end

  defp linkVideoQuestionsStream(video_id, questions, stream_id, type) do
    video = get_video!(video_id)

    Enum.map(questions, fn question ->
      case VideosQuestionsStreams.create_video_question_stream(%{
             id_video: video_id,
             id_question: question.id,
             id_stream: stream_id,
             type: type,
             ada_search: getAdaSearch(question.question, video.answer)
           }) do
        {:ok, vqs} ->
          {:ok, vqs}

        {:error, changeset} ->
          IO.inspect(changeset)
          {:error, changeset}
      end
    end)
  end

  @doc """
  Returns true if user owns the video
  """
  def isOwner(user_id, video_id) do
    query = from(v in Video, where: v.id_video == ^video_id and v.toia_id == ^user_id)
    Repo.one(query) != nil
  end

  @doc """
  Unlink the streams, questions for a video
  """
  def unlinkVideoQuestionsStreams(video_id) do
    query = from(vqs in VideoQuestionStream, where: vqs.id_video == ^video_id)
    {deletedCount, _} = Repo.delete_all(query)
    {:ok, deletedCount}
  end

  @doc """
  Returns ada_search
  """
  def getAdaSearch(question, answer) do
    with {:ok, response} <- GenerateEmbeddings.post("", %{question: question, answer: answer}) do
      Poison.encode!(response.body)
    else
      {:error, reason} ->
        IO.puts(:stderr, "Failed to get ada_search #{inspect(reason)}")
        ""
    end
  end

  @doc """
  Trigger Suggester if necessary
  """
  def triggerSuggester(questions, answer, user_id) do
    Enum.map(questions, fn question ->
      triggerSuggesterEach(question, answer, user_id)
    end)
  end

  defp triggerSuggesterEach(question, answer, user_id) do
    question = Questions.get_question(question.id)

    if question != nil do
      if question.trigger_suggester do
        payload = %{
          "latest_question" => question.id,
          "latest_answer" => answer,
          "toia_id" => user_id
        }

        with {:ok, response} <- QuestionSuggester.post("", payload) do
          {:ok, response.body}
        else
          {:error, reason} -> {:error, reason}
        end
      end
    else
      IO.inspect("Question not found, cannot trigger suggester")
      {:error, "Question not found, cannot trigger suggester"}
    end
  end
end
