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
  Returns the playback url. Legacy: `/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`
  """
  def getPlaybackUrl(first_name, toia_id, video_id) do
    "/#{first_name}_#{toia_id}/Videos/#{video_id}"
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
  Move a file
  """
  def moveFile(oldPath, newPath) do
    with :ok <- File.mkdir_p(Path.dirname(newPath)),
         :ok <- File.rename(oldPath, newPath) do
      {:ok, "File moved"}
    else
      {:error, :eacces} -> {:error, "Permission Denied"}
      {:error, :enoent} -> {:error, "No such file or directory"}
      {:error, :enospc} -> {:error, "No space left on device"}
      {:error, :enotdir} -> {:error, "Not a directory"}
    end
  end

  @doc """
  Save the video file
  """
  def saveVideoFile(first_name, user_id, id_video, upload_path) do
    dest = "Accounts/#{first_name}_#{user_id}/Videos/#{id_video}"
    moveFile(upload_path, dest)
  end

  @doc """
  Link to the streams
  """
  def linkVideoQuestionsStreams(video_id, questions, streams, type) do
    IO.inspect(questions)
    {:ok,
     Enum.map(streams, fn stream_id ->
       linkVideoQuestionsStream(video_id, questions, stream_id, type)
     end)}
  end

  defp linkVideoQuestionsStream(video_id, questions, stream_id, type) do
    Enum.map(questions, fn question ->
      VideosQuestionsStreams.create_video_question_stream(%{
        id_video: video_id,
        id_question: question.id,
        id_stream: stream_id,
        type: type
      })
    end)
  end
end
