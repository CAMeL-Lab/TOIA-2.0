defmodule ToiaWeb.VideoController do
  use ToiaWeb, :controller

  alias Toia.Videos
  alias Toia.Videos.Video
  alias Toia.Questions

  import ToiaWeb.VideoValidator,
    only: [
      validateAnswerParam: 1,
      validateQuestionsParam: 1,
      validateVideoTypeParam: 1,
      validateStreamsList: 2
    ]

  action_fallback(ToiaWeb.FallbackController)

  def index(%{assigns: %{current_user: user}} = conn, _params) do
    video = Videos.list_video(user.id)
    render(conn, :index, video: video)
  end

  @create_params %{
    answer: [type: :string, required: true, into: &validateAnswerParam/1],
    private: [type: :string, required: true],
    streams: [type: :string, required: true, into: &Poison.decode!/1],
    questions: [
      type: :string,
      required: true,
      into: &validateQuestionsParam/1
    ],
    video_duration: [type: :integer, required: true],
    language: [type: :string, required: true],
    videoType: [
      type: :string,
      required: true,
      into: &validateVideoTypeParam/1
    ]
  }
  def create(
        %{assigns: %{current_user: user}} = conn,
        %{"video" => %Plug.Upload{path: path}} = video_params
      ) do
    with {:ok, params} <- Tarams.cast(video_params, @create_params),
         {:ok, streams} <- validateStreamsList(params.streams, user.id),
         {:ok, nextIDX} <- Videos.getNextIdx(),
         {:ok, videoID} <- Videos.generateRandomVideoID(user.first_name, user.id, nextIDX),
         {:ok, questions} <-
           Questions.pre_process_new_questions(params.questions, params.videoType),
         {:ok, _} <- Videos.saveVideoFile(user.first_name, user.id, videoID, path),
         {:ok, _videoEntry} <-
           Videos.create_video(%{
             id_video: videoID,
             toia_id: user.id,
             idx: nextIDX,
             private: params.private,
             answer: params.answer,
             language: params.language,
             duration_seconds: params.video_duration
           }),
         {:ok, _} <-
           Videos.linkVideoQuestionsStreams(videoID, questions, streams, params.videoType),
         {:ok, _} <- Questions.post_process_new_questions(questions, user.id) do
      conn
      |> put_status(:ok)
      |> json(%{videoID: videoID})
    else
      {:error, errors, msg} ->
        IO.inspect(errors)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: msg})

      {:error, errors} ->
        IO.inspect(errors)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Unauthorized"})
    end
  end

  def create(conn, _) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "Invalid parameters"})
  end

  def show(%{assigns: %{current_user: user}} = conn, %{"id" => id} = _video_params) do
    video = Videos.get_video!(id)

    case Videos.canAccess(user, video) do
      true ->
        video = videoWithStreams(video, user.id)
        video = videoWithQuestions(video, user.id)
        playbackUrl = Videos.getPlaybackUrl(user.first_name, user.id, video.id_video)
        video = Map.put(video, :videoURL, playbackUrl)

        conn
        |> put_status(:ok)
        |> render(:videoWithInfo, video: video)

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
    end
  end

  def update(
        %{assigns: %{current_user: user}} = conn,
        %{"id" => oldVideoID, "video" => %Plug.Upload{path: path}} = video_params
      ) do
    with oldVideo <- Videos.get_video!(oldVideoID),
         true <- Videos.isOwner(user.id, oldVideoID),
         {:ok, params} <- Tarams.cast(video_params, @create_params),
         {:ok, streams} <- validateStreamsList(params.streams, user.id),
         {:ok, nextIDX} <- Videos.getNextIdx(),
         {:ok, videoID} <- Videos.generateRandomVideoID(user.first_name, user.id, nextIDX),
         {:ok, _deletedCount} <- Videos.unlinkVideoQuestionsStreams(oldVideoID),
         {:ok, _} <- Videos.delete_video(oldVideo),
         {:ok, _} <- Videos.removeVideoFile(user.first_name, user.id, oldVideoID),
         {:ok, questions} <-
           Questions.pre_process_new_questions(params.questions, params.videoType),
         {:ok, _} <- Videos.saveVideoFile(user.first_name, user.id, videoID, path),
         {:ok, _videoEntry} <-
           Videos.create_video(%{
             id_video: videoID,
             toia_id: user.id,
             idx: nextIDX,
             private: params.private,
             answer: params.answer,
             language: params.language,
             duration_seconds: params.video_duration
           }),
         {:ok, _} <-
           Videos.linkVideoQuestionsStreams(videoID, questions, streams, params.videoType),
         {:ok, _} <- Questions.post_process_new_questions(questions, user.id) do
      conn
      |> put_status(:ok)
      |> json(%{videoID: videoID})
    else
      {:error, err} ->
        IO.inspect(err)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Unauthorized"})

      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Not found"})

      false ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Unauthorized"})

      {:error, errors, msg} ->
        IO.inspect(errors)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: msg})

      x ->
        IO.puts("======== Unknown error ==========")
        IO.inspect(x)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Something went wrong"})
    end
  end

  def delete(conn, %{"id" => id}) do
    video = Videos.get_video!(id)

    with {:ok, %Video{}} <- Videos.delete_video(video) do
      send_resp(conn, :no_content, "")
    end
  end

  def videoWithStreams(video, user_id) do
    if video.toia_id == user_id do
      video = Map.put(video, :isOwner, true)
      streams = Videos.getVideoStreams(video.id_video)
      Map.put(video, :streams, streams)
    else
      video = Map.put(video, :isOwner, false)
      streams = Videos.getVideoPublicStreams(video.id_video)
      Map.put(video, :streams, streams)
    end
  end

  def videoWithQuestions(video, user_id) do
    if video.toia_id == user_id do
      questions = Videos.getVideoQuestions(video.id_video)
      Map.put(video, :questions, questions)
    else
      questions = Videos.getVideoPublicQuestions(video.id_video)
      Map.put(video, :questions, questions)
    end
  end
end
