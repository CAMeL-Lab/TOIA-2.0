defmodule Toia.ToiaUsers do
  @moduledoc """
  The ToiaUsers context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.ToiaUsers.ToiaUser
  alias Toia.Streams.Stream
  alias Toia.Questions.Question
  alias Toia.VideosQuestionsStreams.VideoQuestionStream
  alias Toia.Videos.Video

  @doc """
  Returns the list of toia_user.

  ## Examples

      iex> list_toia_user()
      [%ToiaUser{}, ...]

  """
  def list_toia_user do
    Repo.all(ToiaUser)
  end

  @doc """
  Gets a single toia_user.

  Raises `Ecto.NoResultsError` if the Toia user does not exist.

  ## Examples

      iex> get_toia_user!(123)
      %ToiaUser{}

      iex> get_toia_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_toia_user!(id), do: Repo.get!(ToiaUser, id)
  def get_toia_user_by_email!(email), do: Repo.get_by!(ToiaUser, email: email)

  @doc """
  Creates a toia_user.

  ## Examples

      iex> create_toia_user(%{field: value})
      {:ok, %ToiaUser{}}

      iex> create_toia_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  # `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/All_${stream_entry.insertId}.jpg`;
  def create_toia_user_with_stream(
        %{"profile_pic" => %Plug.Upload{path: path}} = toia_user_params
      ) do
    toia_user_params = Map.delete(toia_user_params, "profile_pic")

    case create_toia_user_with_stream(toia_user_params) do
      {:ok, toia_user, stream} ->
        destDir = "Accounts/#{toia_user.first_name}_#{toia_user.id}/StreamPic/"
        destFilename = "All_#{stream.id_stream}.jpg"

        case File.mkdir_p(destDir) do
          :ok ->
            case File.rename(path, destDir <> destFilename) do
              :ok ->
                {:ok, toia_user, stream}

              {:error, reason} ->
                {:error_pic, reason}
            end

          {:error, reason} ->
            {:error_pic, reason}
        end

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  def create_toia_user_with_stream(attrs) do
    case create_toia_user(attrs) do
      {:ok, %ToiaUser{} = toia_user} ->
        stream = %{name: "All", toia_id: toia_user.id}

        case Toia.Streams.create_stream(stream) do
          {:ok, %Stream{} = created_stream} ->
            {:ok, toia_user, created_stream}

          {:error, changeset} ->
            {:error, changeset}

          _ ->
            {:error, "Failed to create stream"}
        end

      {:error, changeset} ->
        {:error, changeset}

      _ ->
        {:error, "Failed to create user"}
    end
  end

  def create_toia_user(attrs \\ %{}) do
    %{"password" => password} = attrs
    hash = Bcrypt.hash_pwd_salt(password)
    attrs = %{attrs | "password" => hash}

    %ToiaUser{}
    |> ToiaUser.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a toia_user.

  ## Examples

      iex> update_toia_user(toia_user, %{field: new_value})
      {:ok, %ToiaUser{}}

      iex> update_toia_user(toia_user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_toia_user(%ToiaUser{} = toia_user, attrs) do
    toia_user
    |> ToiaUser.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a toia_user.

  ## Examples

      iex> delete_toia_user(toia_user)
      {:ok, %ToiaUser{}}

      iex> delete_toia_user(toia_user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_toia_user(%ToiaUser{} = toia_user) do
    Repo.delete(toia_user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking toia_user changes.

  ## Examples

      iex> change_toia_user(toia_user)
      %Ecto.Changeset{data: %ToiaUser{}}

  """
  def change_toia_user(%ToiaUser{} = toia_user, attrs \\ %{}) do
    ToiaUser.changeset(toia_user, attrs)
  end

  @doc """
  Returns the list of onbaording questions for a toia_user.
  """
  def get_onboarding_questions(user_id) do
    completed =
      from(vqs in VideoQuestionStream,
        join: v in Video,
        on: vqs.id_video == v.id_video,
        join: q in Question,
        on: q.id == vqs.id_question,
        where: v.toia_id == ^user_id,
        where: q.onboarding == true,
        select: %{
          id: q.id,
          question: q.question,
          suggested_type: q.suggested_type,
          onboarding: q.onboarding,
          priority: q.priority,
          trigger_suggester: q.trigger_suggester,
          pending: false
        }
      )

    completed = Repo.all(completed) |> Enum.uniq_by(& &1.id)
    completed_ids = Enum.map(completed, & &1.id)

    pending =
      from(q in Question,
        where: q.onboarding == true,
        where: q.id not in ^completed_ids,
        select: %{
          id: q.id,
          question: q.question,
          suggested_type: q.suggested_type,
          onboarding: q.onboarding,
          priority: q.priority,
          trigger_suggester: q.trigger_suggester,
          pending: true
        }
      )

    pending = Repo.all(pending) |> Enum.uniq_by(& &1.id)
    pending ++ completed
  end

  @doc """
  Returns totalVideosCount, totalStreamCounts, totalVideoDuration
  """
  def get_stats(user_id) do
    videos_count = video_count(user_id)
    streams_count = stream_count(user_id)
    video_duration = video_duration(user_id)

    %{
      totalVideosCount: videos_count,
      totalStreamCounts: streams_count,
      totalVideoDuration: video_duration
    }
  end

  @doc """
  Returns a list of recorded video ids
  """
  def recorded_video_ids(user_id) do
    query =
      from(v in Video,
        join: vqs in VideoQuestionStream,
        on: v.id_video == vqs.id_video,
        where: v.toia_id == ^user_id,
        select: v.id_video
      )

    Repo.all(query) |> Enum.uniq()
  end

  @doc """
  Returns the number of videos uploaded by this user
  """
  def video_count(user_id) do
    valid_ids = recorded_video_ids(user_id)

    query =
      from(v in Video,
        where: v.id_video in ^valid_ids,
        select: count(v.id_video)
      )

    Repo.one(query)
  end

  @doc """
  Returns the number of streams created by this user
  """
  def stream_count(user_id) do
    query = from(s in Stream, where: s.toia_id == ^user_id, select: count(s.id_stream))
    Repo.one(query)
  end

  @doc """
  Returns the total duration of videos uploaded by this user
  """
  def video_duration(user_id) do
    valid_ids = recorded_video_ids(user_id)

    query =
      from(v in Video,
        where: v.id_video in ^valid_ids,
        select: sum(v.duration_seconds)
      )

    Repo.one(query) || 0
  end

  @doc """
  Returns if the user owns a stream
  """
  def owns_stream(user_id, stream_id) do
    query =
      from(s in Stream,
        where: s.id_stream == ^stream_id,
        where: s.toia_id == ^user_id,
        select: count(s.id_stream)
      )

    Repo.one(query) > 0
  end
end
