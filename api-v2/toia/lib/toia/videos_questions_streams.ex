defmodule Toia.VideosQuestionsStreams do
  @moduledoc """
  The VideosQuestionsStreams context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.VideosQuestionsStreams.VideoQuestionStream
  alias Toia.Videos.Video

  @doc """
  Returns the list of videos_questions_streams.

  ## Examples

      iex> list_videos_questions_streams()
      [%VideoQuestionStream{}, ...]

  """
  def list_videos_questions_streams do
    Repo.all(VideoQuestionStream)
  end

  @doc """
  Gets a single video_question_stream.

  Raises `Ecto.NoResultsError` if the Video question stream does not exist.

  ## Examples

      iex> get_video_question_stream!(123)
      %VideoQuestionStream{}

      iex> get_video_question_stream!(456)
      ** (Ecto.NoResultsError)

  """
  def get_video_question_stream!(id), do: Repo.get!(VideoQuestionStream, id)

  @doc """
  Creates a video_question_stream.

  ## Examples

      iex> create_video_question_stream(%{field: value})
      {:ok, %VideoQuestionStream{}}

      iex> create_video_question_stream(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_video_question_stream(attrs \\ %{}) do
    %VideoQuestionStream{}
    |> VideoQuestionStream.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a video_question_stream.

  ## Examples

      iex> update_video_question_stream(video_question_stream, %{field: new_value})
      {:ok, %VideoQuestionStream{}}

      iex> update_video_question_stream(video_question_stream, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_video_question_stream(%VideoQuestionStream{} = video_question_stream, attrs) do
    video_question_stream
    |> VideoQuestionStream.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a video_question_stream.

  ## Examples

      iex> delete_video_question_stream(video_question_stream)
      {:ok, %VideoQuestionStream{}}

      iex> delete_video_question_stream(video_question_stream)
      {:error, %Ecto.Changeset{}}

  """
  def delete_video_question_stream(%VideoQuestionStream{} = video_question_stream) do
    Repo.delete(video_question_stream)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking video_question_stream changes.

  ## Examples

      iex> change_video_question_stream(video_question_stream)
      %Ecto.Changeset{data: %VideoQuestionStream{}}

  """
  def change_video_question_stream(%VideoQuestionStream{} = video_question_stream, attrs \\ %{}) do
    VideoQuestionStream.changeset(video_question_stream, attrs)
  end

  @doc """
  Returns true if the question has been recorded by the user.
  """
  def has_recorded(user_id, question_id) do
    query =
      from vqs in VideoQuestionStream,
        inner_join: v in Video,
        on: vqs.id_video == v.id_video,
        where: v.toia_id == ^user_id and vqs.id_question == ^question_id

    Repo.exists?(query)
  end
end
