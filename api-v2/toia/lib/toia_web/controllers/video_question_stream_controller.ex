defmodule ToiaWeb.VideoQuestionStreamController do
  use ToiaWeb, :controller

  alias Toia.VideosQuestionsStreams
  alias Toia.VideosQuestionsStreams.VideoQuestionStream

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    videos_questions_streams = VideosQuestionsStreams.list_videos_questions_streams()
    render(conn, :index, videos_questions_streams: videos_questions_streams)
  end

  def create(conn, %{"video_question_stream" => video_question_stream_params}) do
    with {:ok, %VideoQuestionStream{} = video_question_stream} <-
           VideosQuestionsStreams.create_video_question_stream(video_question_stream_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/videos_questions_streams/#{video_question_stream}")
      |> render(:show, video_question_stream: video_question_stream)
    end
  end

  def show(conn, %{"id" => id}) do
    video_question_stream = VideosQuestionsStreams.get_video_question_stream!(id)
    render(conn, :show, video_question_stream: video_question_stream)
  end

  def update(conn, %{"id" => id, "video_question_stream" => video_question_stream_params}) do
    video_question_stream = VideosQuestionsStreams.get_video_question_stream!(id)

    with {:ok, %VideoQuestionStream{} = video_question_stream} <-
           VideosQuestionsStreams.update_video_question_stream(
             video_question_stream,
             video_question_stream_params
           ) do
      render(conn, :show, video_question_stream: video_question_stream)
    end
  end

  def delete(conn, %{"id" => id}) do
    video_question_stream = VideosQuestionsStreams.get_video_question_stream!(id)

    with {:ok, %VideoQuestionStream{}} <-
           VideosQuestionsStreams.delete_video_question_stream(video_question_stream) do
      send_resp(conn, :no_content, "")
    end
  end
end
