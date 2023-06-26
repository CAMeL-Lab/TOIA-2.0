defmodule ToiaWeb.VideoJSON do
  alias Toia.Videos.Video

  @doc """
  Renders a list of video.
  """
  def index(%{video: video}) do
    for(video <- video, do: data(video))
  end

  @doc """
  Renders a single video.
  """
  def show(%{video: video}) do
    data(video)
  end

  def videoWithInfo(%{video: video}) do
    streams = video.streams
    streams = Enum.map(streams, fn stream ->
      %{
        id_stream: stream.id_stream,
        name: stream.name,
        private: stream.private,
        likes: stream.likes,
        views: stream.views,
        toia_id: stream.toia_id,
      }
    end)
    questions = video.questions
    questions = Enum.map(questions, fn question ->
      %{
        id_question: question.id,
        question: question.question,
        priority: question.priority,
        onboarding: question.onboarding,
        suggested_type: question.suggested_type,
        trigger_suggester: question.trigger_suggester
      }
    end)
    data(video) |> Map.put(:streams, streams) |> Map.put(:questions, questions)
  end

  defp data(%{videoURL: _} = video) do
    %{
      id_video: video.id_video,
      idx: video.idx,
      private: video.private,
      answer: video.answer,
      language: video.language,
      likes: video.likes,
      views: video.views,
      duration_seconds: video.duration_seconds,
      toia_id: video.toia_id,
      videoURL: video.videoURL
    }
  end

  defp data(%Video{} = video) do
    %{
      id_video: video.id_video,
      idx: video.idx,
      private: video.private,
      answer: video.answer,
      language: video.language,
      likes: video.likes,
      views: video.views,
      duration_seconds: video.duration_seconds,
      toia_id: video.toia_id
    }
  end
end
