defmodule ToiaWeb.VideoQuestionStreamJSON do
  alias Toia.VideosQuestionsStreams.VideoQuestionStream

  @doc """
  Renders a list of videos_questions_streams.
  """
  def index(%{videos_questions_streams: videos_questions_streams}) do
    %{data: for(video_question_stream <- videos_questions_streams, do: data(video_question_stream))}
  end

  @doc """
  Renders a single video_question_stream.
  """
  def show(%{video_question_stream: video_question_stream}) do
    %{data: data(video_question_stream)}
  end

  defp data(%VideoQuestionStream{} = video_question_stream) do
    %{
      id: video_question_stream.id,
      type: video_question_stream.type,
      ada_search: video_question_stream.ada_search
    }
  end
end
